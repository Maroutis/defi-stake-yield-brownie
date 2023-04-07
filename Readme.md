# defi-stake-yield-brownie

# Preview the project here: https://mmtis.github.io/defi-stake-yield-brownie/

<br/>
<p align="center">
<a href="https://mmtis.github.io/defi-stake-yield-brownie/" target="_blank">
<img src="./web-image.png" width="500" alt="Dapp Token Farm App">
</a>
</p>
<br/>

## Summary 
This app allows you to:

- `stakeTokens`: Add any approved token to the farming contract for yield farming, collateral, or whatever you want to do.
- `getUserAccruedReward`: Get the accrued interest generated
- `unStakeTokens`: Remove your tokens from the contract and collect your reward.
- `getUserTVL`: Get the total value that users have supplied based on calculations from the Chainlink Price Feeds. 
- `getNumberOfTokensFromValue`: Convert the reward value generated into tokens (reward tokens).
- `ReinvestAccruedReward`: Move your reward to the staking pool for more rewards.

You can also withdraw the reward, manage a list of allowed tokens, change the APR and more!

- [defi-stake-yield-brownie](#defi-stake-yield-brownie)
  - [Summary](#summary)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#useage)
  - [Scripts](#scripts)
  - [Front end](#front-end)
  - [Testing](#testing)
- [License](#license)

## Prerequisites

Please install or have installed the following:

- [nodejs and npm](https://nodejs.org/en/download/)
- [python](https://www.python.org/downloads/)
## Installation

1.Setup the python environment and [Install Brownie](https://eth-brownie.readthedocs.io/en/stable/install.html), if you haven't already. Here is a simple way to install all the python required packages.

```bash
pip install -r requirements.txt
```

You can also install brownie without using the requirements.txt file. Here is a simple way to install brownie.
```bash
pip install --user pipx
pipx ensurepath
# restart your terminal
pipx install eth-brownie
```
Or if you can't get `pipx` to work, via pip (it's recommended to use pipx)
```bash
pip install eth-brownie
```

2. Clone this repo
```
git clone https://github.com/MMtis/defi-stake-yield-brownie
cd defi-stake-yield-brownie
```

3. [Install ganache-cli](https://www.npmjs.com/package/ganache-cli)

```bash
npm install -g ganache-cli
```

If you want to be able to deploy to testnets, do the following. 

4. Set your environment variables

Set your `WEB3_INFURA_PROJECT_ID`, and `PRIVATE_KEY` [environment variables]. 

You'll also need testnet Goerli or Sepolia ETH and LINK. You can get ETH into your wallet by using the [sepolia faucets located here](https://sepoliafaucet.com/).

You'll also want an [Etherscan API Key](https://etherscan.io/apis) to verify your smart contracts. 

You can add your environment variables to the `.env` file:
```bash
export WEB3_INFURA_PROJECT_ID=<PROJECT_ID>
export PRIVATE_KEY=<PRIVATE_KEY>
export ETHERSCAN_TOKEN=<YOUR_TOKEN>
```
> DO NOT SEND YOUR KEYS TO GITHUB
> If you do that, people can steal all your funds. Ideally use an account with no real money in it.

5. Add a new network (sepolia)

You can add a new network in brownie using the following
```bash
brownie networks add Ethereum "Sepolia (Infura)" id="sepolia" host="https://sepolia.infura.io/v3/<YOUR_INFURA_PROJECT_ID>" chainid=11155111 explorer="https://api-sepolia.etherscan.io/api?apikey=<ETHERSCAN_YOUR_TOKEN>"
```

# Usage

## Scripts

```bash
brownie run scripts/deploy.py
```
This will deploy the contracts, depoly some mock Chainlink contracts for you to interact with.
```bash
brownie run scripts/deploy.py --network goerli
```
This will do the same thing... but on goerli.

## Front end
Install all the necessary packages and start the application
```bash
cd front_end
yarn install
yarn start
```
and you'll be able to interact with the UI

## Testing

```
brownie test
```

# License

This project is licensed under the [MIT license](LICENSE).