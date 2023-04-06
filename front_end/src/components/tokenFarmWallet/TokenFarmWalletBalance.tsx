import { Token } from "../Main"
import { useEthers, useCall } from "@usedapp/core"
import { formatUnits } from "@ethersproject/units"
import { BalanceMsg } from "../../components/BalanceMsg"
import { constants, utils } from "ethers"
import { Contract } from "@ethersproject/contracts"
import TokenFarm from "../../chain-info/contracts/TokenFarm.json"
import networkMapping from "../../chain-info/deployments/map.json"
import { networks } from "../../SupportedChains"
import { useGetStakingBalance } from "../../hooks"

export interface WalletBalanceProps {
    token: Token
}

export const TokenFarmWalletBalance = ({ token }: WalletBalanceProps) => {
    const { image, address, name } = token
    const { account } = useEthers()
    const value = useGetStakingBalance(address, account)


    //const tokenBalance = useTokenBalance(address, account)
    const formattedTokenBalance: number = value ? parseFloat(formatUnits(value.toString(), 18)) : 0
    return (<BalanceMsg
        label={`Your staked ${name} balance:`}
        tokenImgSrc={image}
        amount={formattedTokenBalance} />)
}