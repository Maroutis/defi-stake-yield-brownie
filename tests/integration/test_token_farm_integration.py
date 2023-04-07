from brownie import network
from scripts.helpful_scripts import (
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
    get_account,
    get_contract,
)
from scripts.deploy import deploy_token_farm_and_dapp_token
import pytest
import time


def test_stake_and_withdraw_correct_amounts(amount_staked):
    # Arrange
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for integration testing!")
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    account = get_account()
    dapp_token.approve(token_farm.address, amount_staked, {"from": account})
    tx = token_farm.stakeTokens(amount_staked, dapp_token.address, {"from": account})
    tx.wait(1)
    starting_balance = dapp_token.balanceOf(account.address)

    time.sleep(10)
    # reward = token_farm.getUserAccruedReward(account, {"from": account})
    # Act
    tx = token_farm.unstakeTokens(dapp_token, {"from": account})
    tx.wait(1)
    reward = tx.events["RewardWithdrawn"]["amount"]
    # Assert
    assert (
        dapp_token.balanceOf(account.address)
        == amount_staked + starting_balance + reward
    )
