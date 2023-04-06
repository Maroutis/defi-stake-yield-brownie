from brownie import DappToken, network
import pytest
from scripts.helpful_scripts import get_account, LOCAL_BLOCKCHAIN_ENVIRONMENTS


def test_can_deploy_token():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    # Arrange
    account = get_account()
    total_supply = 1000000 * 10**18

    # Act
    dt = DappToken.deploy({"from": account})

    # Assert
    assert dt.symbol() == "DAPP"
    assert dt.decimals() == 18
    assert dt.name() == "Dapp Token"
    assert dt.totalSupply() == 1000000 * 10**18
    assert dt.balanceOf(account) == dt.totalSupply()
