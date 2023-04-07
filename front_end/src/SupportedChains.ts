import { Goerli, Sepolia, Config } from "@usedapp/core"
import { getDefaultProvider } from 'ethers'

export const networks = [Goerli, Sepolia]
export const config: Config = {
    networks: [Goerli, Sepolia],
    readOnlyChainId: Sepolia.chainId,
    readOnlyUrls: {
      [Goerli.chainId]: getDefaultProvider('goerli'),
      [Sepolia.chainId]: getDefaultProvider('sepolia')
    },
    notifications: {
      expirationPeriod: 1000,
      checkInterval: 1000,
    },
  }