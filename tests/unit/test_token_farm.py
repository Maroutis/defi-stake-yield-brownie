from brownie import network, exceptions, chain
from scripts.helpful_scripts import (
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
    INITIAL_PRICE_FEED_VALUE,
    DECIMALS,
    get_account,
    get_contract,
)
import pytest
from scripts.deploy import deploy_token_farm_and_dapp_token, KEPT_BALANCE
import time


def test_set_price_feed_contract():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    non_owner = get_account(index=1)
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    # Act
    price_feed_address = get_contract("dai_usd_price_feed")
    token_farm.setPriceFeedContract(
        dapp_token.address, price_feed_address, {"from": account}
    )  # if you give a contract instead of an address brownie recognizes that's it's address
    # Assert
    assert token_farm.tokenPriceFeedMapping(dapp_token.address) == price_feed_address
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.setPriceFeedContract(
            dapp_token.address, price_feed_address, {"from": non_owner}
        )


def test_set_APR():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    # Arrange
    account = get_account()
    non_owner = get_account(index=1)
    token_farm, _ = deploy_token_farm_and_dapp_token()
    new_APR = 2000

    # Act
    token_farm.setAPR(new_APR, {"from": account})

    # Assert
    assert token_farm.APR() == new_APR
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.setAPR(new_APR, {"from": non_owner})


def test_stake_tokens(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    starting_balance = dapp_token.balanceOf(token_farm.address)
    # Act
    dapp_token.approve(token_farm.address, amount_staked, {"from": account})
    starting_balance_timestamp = time.time()
    chain.sleep(1)
    token_farm.stakeTokens(amount_staked, dapp_token.address, {"from": account})
    (token, amount, WithdrawTime) = token_farm.stakerStakes(account.address, 0)
    # Assert
    assert (
        token_farm.stakingBalance(dapp_token.address, account.address) == amount_staked
    )
    assert token_farm.uniqueTokensStaked(account.address) == 1
    assert token_farm.stakers(0) == account.address
    assert token == dapp_token.address
    assert amount == amount_staked
    assert WithdrawTime > starting_balance_timestamp
    assert dapp_token.balanceOf(token_farm.address) - starting_balance == amount_staked
    return token_farm, dapp_token


def test_withdraw_rewards(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    # Arrange
    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)
    starting_balance = dapp_token.balanceOf(account)
    (_, _, starting_timestamp) = token_farm.stakerStakes(account.address, 0)
    chain.sleep(1000)
    chain.mine(1)
    # reward = token_farm.getUserAccruedReward(account, {"from": account})
    # Act
    tx = token_farm.withdrawMyReward({"from": account})
    reward = tx.events["RewardWithdrawn"]["amount"]
    chain.sleep(1000)
    chain.mine(1)
    # new_reward = token_farm.getUserAccruedReward(account, {"from": account})
    (_, _, timestamp) = token_farm.stakerStakes(account.address, 0)
    # Assert
    assert dapp_token.balanceOf(account) == starting_balance + reward
    # assert reward == new_reward
    assert starting_timestamp < timestamp


def test_get_user_value_for_one_token(amount_staked, random_erc20):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    token_farm, _ = test_stake_tokens(amount_staked)
    # Act
    token_farm.addAllowedTokens(random_erc20.address, {"from": account})
    token_farm.setPriceFeedContract(
        random_erc20.address, get_contract("eth_usd_price_feed"), {"from": account}
    )
    value = token_farm.getUserTokenValue(amount_staked, random_erc20.address)
    # Assert
    assert value == INITIAL_PRICE_FEED_VALUE


def test_get_number_of_tokens_from_value(amount_staked, random_erc20):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    token_farm, dapp_token = test_stake_tokens(amount_staked)
    # Act
    value = token_farm.getNumberOfTokensFromValue(amount_staked, dapp_token)
    # Assert
    assert value == 500000000000000


def test_get_token_value():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    # Act / Assert
    assert token_farm.getTokenValue(dapp_token.address) == (
        INITIAL_PRICE_FEED_VALUE,
        DECIMALS,
    )


def test_get_tvl_zero():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    token_farm, _ = deploy_token_farm_and_dapp_token()
    # Act
    tvl = token_farm.getUserTVL(account, {"from": account})
    # Assert
    assert tvl == 0


def test_get_user_accrued_reward_zero():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    # Arrange
    account = get_account()
    token_farm, _ = deploy_token_farm_and_dapp_token()

    # Act
    ar = token_farm.getUserAccruedReward(account, {"from": account})

    # Assert
    assert ar == 0


def test_unstake_tokens(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)
    chain.sleep(1001)
    chain.mine(1)
    starting_balance = dapp_token.balanceOf(account)
    # reward = token_farm.getUserAccruedReward(account, {"from": account})
    # Act
    tx = token_farm.unstakeTokens(dapp_token.address, {"from": account})
    BalanceUnstaken = tx.events["TokensUnstaked"]["amount"]
    reward = tx.events["RewardWithdrawn"]["amount"]
    # Assert
    assert BalanceUnstaken == amount_staked
    assert dapp_token.balanceOf(account) == starting_balance + reward + amount_staked
    assert token_farm.stakingBalance(dapp_token.address, account.address) == 0
    assert token_farm.uniqueTokensStaked(account.address) == 0
    # hack check for empty myStakes array
    with pytest.raises(exceptions.VirtualMachineError):
        assert token_farm.stakerStakes(account.address, 0)
    # hack check for empty stakers array
    with pytest.raises(exceptions.VirtualMachineError):
        assert token_farm.stakers(0)


def test_reinvest_rewards(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    token_farm, dapp_token = test_stake_tokens(amount_staked)
    chain.sleep(1000)
    chain.mine(1)
    # reward = token_farm.getUserAccruedReward(account, {"from": account})
    (_, _, staking_balance_timestamp) = token_farm.stakerStakes(account.address, 0)
    # Act
    tx = token_farm.ReinvestAccruedReward({"from": account})
    reward = tx.events["RewardReinvested"]["amount"]
    (token, amount, WithdrawTime) = token_farm.stakerStakes(account.address, 0)
    (token1, amount1, WithdrawTime1) = token_farm.stakerStakes(account.address, 1)
    # Assert
    assert (
        token_farm.stakingBalance(dapp_token.address, account.address)
        == amount_staked + reward
    )
    assert token_farm.uniqueTokensStaked(account.address) == 1
    assert token_farm.stakers(0) == account.address
    assert token == dapp_token.address
    assert amount == amount_staked
    assert WithdrawTime > staking_balance_timestamp
    assert token1 == dapp_token.address
    assert amount1 == reward
    assert WithdrawTime1 > staking_balance_timestamp
    assert WithdrawTime == WithdrawTime1


def test_get_tvl(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    token_farm, _ = test_stake_tokens(amount_staked)
    # Act
    tvl = token_farm.getUserTVL(account, {"from": account})
    # Assert
    assert tvl == INITIAL_PRICE_FEED_VALUE


def test_get_user_accrued_reward(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    # Arrange
    account = get_account()
    token_farm, _ = test_stake_tokens(amount_staked)
    chain.sleep(1000)
    chain.mine(1)

    # Act
    ar = token_farm.getUserAccruedReward(account, {"from": account})

    # Assert
    assert ar > 0


def test_add_allowed_tokens():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    non_owner = get_account(index=1)
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    # Act
    token_farm.addAllowedTokens(dapp_token.address, {"from": account})
    # Assert
    assert token_farm.allowedTokens(0) == dapp_token.address
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.addAllowedTokens(dapp_token.address, {"from": non_owner})


def test_token_is_allowed():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")

    token_farm, dapp_token = deploy_token_farm_and_dapp_token()

    # Assert
    assert (
        token_farm.tokenIsAllowed(dapp_token.address) == True
    )  # tokenIsAllowed should be marked as view or it will return a transaction
