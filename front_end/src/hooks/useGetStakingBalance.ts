import { useEthers, useCall, Falsy } from "@usedapp/core"
import { constants, utils } from "ethers"
import { Contract } from "@ethersproject/contracts"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import networkMapping from "../chain-info/deployments/map.json"
import { networks } from "../SupportedChains"
import { classicNameResolver } from "typescript"


export const useGetStakingBalance = (
    tokenAddress: string | Falsy,
    userAddress: string | Falsy) => {

    const { chainId } = useEthers()
    const { abi } = TokenFarm
    const isCorrectChain = networks.some(chain => chain.chainId === chainId);
    const tokenFarmAddress = chainId && isCorrectChain ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero
    const tokenFarmInterface = new utils.Interface(abi)
    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface)

    const { value, error } = useCall(tokenFarmAddress && {
        contract: tokenFarmContract,
        method: 'stakingBalance',
        args: [tokenAddress, userAddress]
    }) ?? {}

    if (error) {
        console.error(error.message)
        return 0
    }
    return value?.[0]
}