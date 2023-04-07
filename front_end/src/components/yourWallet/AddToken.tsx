import { Button } from "@material-ui/core";
import { Token } from "../Main"
import { useEthers } from "@usedapp/core"
import { networks } from "../../SupportedChains"

declare const window: Window & { ethereum?: any };

export interface AddToMetamaskProps {
    token: Token;
}

export const AddToMetamaskButton = ({ token }: AddToMetamaskProps) => {

    const { address, name, image, decimals } = token
    const { chainId, error } = useEthers()

    const isCorrectChain = networks.some(chain => chain.chainId === chainId);

    async function addToMetamask() {
        if (!window.ethereum) {
            console.log("Metamask is not installed. Please install Metamask to continue.");
            return;
        }

        try {
            await window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20",
                    options: {
                        address: address,
                        symbol: name,
                        decimals: decimals,
                        image: image
                    }
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <Button
                variant="outlined"
                color="primary"
                onClick={addToMetamask}
                disabled={!isCorrectChain}>
                Add to Metamask
            </Button>
        </>
    );
}
