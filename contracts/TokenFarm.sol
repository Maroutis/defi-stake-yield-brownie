// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract TokenFarm is Ownable {
    // boolean to prevent reentrancy
    bool internal locked;

    // Staked tokens with their amount and timestamps
    // The timestamp at the time the user initially staked their tokens
    struct Stake {
        address token;
        uint256 amount;
        uint256 lastWithdrawTime;
    }
    // mapping token address -> staker address -> amount
    mapping(address => mapping(address => uint256)) public stakingBalance;
    // List of tokens and stakers
    mapping(address => uint256) public uniqueTokensStaked;
    mapping(address => address) public tokenPriceFeedMapping;
    mapping(address => Stake[]) public stakerStakes;
    address[] public stakers;
    address[] public allowedTokens;
    // Reward Token
    IERC20 public dappToken;
    // APR expressed with 2 decimals
    uint256 public APR;

    // Events
    event TokensStaked(address from, uint256 amount);
    event TokensUnstaked(address to, uint256 amount);
    event RewardWithdrawn(address to, uint256 amount);
    event RewardReinvested(address to, uint256 amount);

    constructor(address _dappTokenAddress) {
        dappToken = IERC20(_dappTokenAddress);
        APR = 1500; // 15%
        locked = false;
    }

    // Modifier to prevent reentrancy
    modifier noReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    // Set price feed of a token
    function setPriceFeedContract(
        address _token,
        address _priceFeed
    ) public onlyOwner {
        tokenPriceFeedMapping[_token] = _priceFeed;
    }

    // Customize APR
    function setAPR(uint256 newAPR) public onlyOwner {
        APR = newAPR;
    }

    // Get the price value of a token
    function getTokenValue(
        address _token
    ) public view returns (uint256, uint256) {
        // pricefeedAddress
        address priceFeedAddress = tokenPriceFeedMapping[_token];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            priceFeedAddress
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        uint256 decimals = uint256(priceFeed.decimals());
        return (uint256(price), decimals);
    }

    // USD price of staked tokens
    function getUserTokenValue(
        uint256 amount,
        address token
    ) public view returns (uint256) {
        (uint256 price, uint256 decimals) = getTokenValue(token);
        return (amount * price) / 10 ** (decimals);
    }

    // Returns the number of a specific token using the value amount
    function getNumberOfTokensFromValue(
        uint256 amount,
        address token
    ) public view returns (uint256) {
        (uint256 price, uint256 decimals) = getTokenValue(token);
        return (amount * 10 ** decimals) / price;
    }

    // Returns the total value of the staked tokens
    function getUserTVL(address user) public view returns (uint256) {
        if (uniqueTokensStaked[user] > 0) {
            uint256 totalValue = 0;

            for (uint256 i = 0; i < allowedTokens.length; i++) {
                address token = allowedTokens[i];
                uint256 amount = stakingBalance[token][user];
                if (amount > 0) {
                    totalValue += getUserTokenValue(amount, token);
                }
            }
            return totalValue;
        } else return 0;
    }

    // Calculate The accrued reward in terms of Dapp Token
    function getUserAccruedReward(address user) public view returns (uint256) {
        if (uniqueTokensStaked[user] > 0) {
            uint256 totalReward = 0;

            Stake[] memory myStakes = stakerStakes[user];
            for (uint256 i = 0; i < myStakes.length; i++) {
                uint256 stakeAnnualValue = 0;
                uint256 accruedValue = 0;
                address token = myStakes[i].token;
                uint256 amount = myStakes[i].amount;
                uint256 stakeTime = myStakes[i].lastWithdrawTime;

                uint256 tvlStake = getUserTokenValue(amount, token);
                stakeAnnualValue = (tvlStake * APR) / 10 ** 4;

                uint256 year = 365 days;
                uint256 timeSinceStake = block.timestamp - stakeTime;
                uint256 accruedSoFarPercent = (timeSinceStake * 10 ** 9) / year;

                accruedValue =
                    (stakeAnnualValue * accruedSoFarPercent) /
                    10 ** 9;
                totalReward += getNumberOfTokensFromValue(
                    accruedValue,
                    address(dappToken)
                );
            }
            return totalReward;
        } else return 0;
    }

    // Stake
    function stakeTokens(uint256 _amount, address _token) public {
        bool _fromReward = false;
        stakeTokens(_amount, _token, _fromReward);
    }

    function stakeTokens(
        uint256 _amount,
        address _token,
        bool _fromReward
    ) internal {
        require(_amount > 0, "Amount must be more than 0"); // works because version doesn't require safemath
        require(tokenIsAllowed(_token), "Token is currently not allowed");
        if (uniqueTokensStaked[msg.sender] == 0) {
            stakers.push(msg.sender);
        }
        updateUniqueTokensStaked(msg.sender, _token);
        Stake memory stake = Stake(_token, _amount, block.timestamp);
        stakerStakes[msg.sender].push(stake);
        stakingBalance[_token][msg.sender] += _amount;
        if (!_fromReward) {
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        }
        emit TokensStaked(msg.sender, _amount);
    }

    // Unstake tokens and withraw rewards
    function unstakeTokens(address _token) public noReentrant {
        require(tokenIsAllowed(_token), "Token is currently not allowed");
        uint256 balance = stakingBalance[_token][msg.sender];
        require(balance > 0, "Staking balance cannot be 0");

        stakingBalance[_token][msg.sender] = 0; // reentrency attacks

        IERC20(_token).transfer(msg.sender, balance);
        withdrawMyReward();

        uniqueTokensStaked[msg.sender]--;

        Stake[] storage myStakes = stakerStakes[msg.sender];
        for (int256 i = int256(myStakes.length - 1); i >= 0; i--) {
            if (myStakes[uint256(i)].token == _token) {
                if (uint256(i) == myStakes.length - 1) {
                    myStakes.pop();
                } else {
                    myStakes[uint256(i)] = myStakes[myStakes.length - 1];
                    myStakes.pop();
                }
            }
        }

        if (uniqueTokensStaked[msg.sender] == 0) {
            for (
                uint256 stakersIndex = 0;
                stakersIndex < stakers.length;
                stakersIndex++
            ) {
                if (stakers[stakersIndex] == msg.sender) {
                    stakers[stakersIndex] = stakers[stakers.length - 1];
                    stakers.pop();
                    break;
                }
            }
        }
        emit TokensUnstaked(msg.sender, balance);
    }

    // Withdraw accrued reward and update lastWithdrawTime
    function withdrawMyReward() public {
        uint256 myReward = getUserAccruedReward(msg.sender);
        require(myReward > 0, "You have not accrued enough DAPP tokens");
        dappToken.transfer(msg.sender, myReward);

        Stake[] storage myStakes = stakerStakes[msg.sender];
        for (uint256 i = 0; i < myStakes.length; i++) {
            myStakes[i].lastWithdrawTime = block.timestamp;
        }
        emit RewardWithdrawn(msg.sender, myReward);
    }

    // Reinvest reward in DAPP Token
    function ReinvestAccruedReward() public noReentrant {
        uint256 reward = getUserAccruedReward(msg.sender);
        require(reward > 0, "No reward to withdraw");

        // Stake the reward
        stakeTokens(reward, address(dappToken), true);

        // Update lastWithdrawTime for all stakes in the stakerStakes array
        Stake[] storage myStakes = stakerStakes[msg.sender];
        for (uint256 i = 0; i < myStakes.length; i++) {
            myStakes[i].lastWithdrawTime = block.timestamp;
        }
        emit RewardReinvested(msg.sender, reward);
    }

    // Update unique tokens staked
    function updateUniqueTokensStaked(address _user, address _token) internal {
        if (stakingBalance[_token][_user] <= 0) {
            uniqueTokensStaked[_user] = uniqueTokensStaked[_user] + 1;
        }
    }

    // Add allowed tokens for staking
    function addAllowedTokens(address _token) public onlyOwner {
        allowedTokens.push(_token);
    }

    // Check if a token is allowed for staking
    function tokenIsAllowed(address _token) public view returns (bool) {
        for (
            uint256 allowedTokensIndex = 0;
            allowedTokensIndex < allowedTokens.length;
            allowedTokensIndex++
        ) {
            if (allowedTokens[allowedTokensIndex] == _token) {
                return true;
            }
        }
        return false;
    }
}
