import { useEthers, useContractFunction } from "@usedapp/core"
import { constants, utils } from "ethers"
import TokenFarm from "../chain-info/contracts/TokenFarm.json"
import { Contract } from "@ethersproject/contracts"
import networkMapping from "../chain-info/deployments/map.json"
import { networks } from "../SupportedChains"

export const useReinvestAccruedReward = () => {
    // address
    // abi
    // chainId
    const { chainId } = useEthers()
    const { abi } = TokenFarm
    const isCorrectChain = networks.some(chain => chain.chainId === chainId);
    const tokenFarmAddress = chainId && isCorrectChain ? networkMapping[String(chainId)]["TokenFarm"][0] : constants.AddressZero
    const tokenFarmInterface = new utils.Interface(abi)
    const tokenFarmContract = new Contract(tokenFarmAddress, tokenFarmInterface)


    const { send: ReinvestSend, state: ReinvestState } =
        useContractFunction(tokenFarmContract, "ReinvestAccruedReward", {
            transactionName: "Reinvest Accrued Reward"
        })
    const Reinvest = () => {
        return ReinvestSend()
    }

    return { Reinvest, ReinvestState }

}