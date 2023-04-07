import React, { useEffect, useState } from "react"
import { useEthers } from "@usedapp/core"
import helperConfig from "../helper-config.json"
import networkMapping from "../chain-info/deployments/map.json"
import { constants } from "ethers"
import brownieConfig from "../brownie-config.json"
import dapp from "../dapp.png"
import dai from "../dai.png"
import eth from "../eth.png"
import { Wallets } from "./Wallets"
import { Reward } from "./yourReward"
import { makeStyles, Snackbar, Typography } from "@material-ui/core"
import Alert from "@material-ui/lab/Alert"
import { networks } from "../SupportedChains"


export type Token = {
    image: string
    address: string
    name: string
    decimals: number
}

function lowerCaseFirstLetter(string: string) {
    return string[0].toLowerCase() + string.slice(1);
}

const useStyles = makeStyles((theme) => ({
    title: {
        color: theme.palette.common.white,
        textAlign: "center",
        padding: theme.spacing(4),
        marginTop: "-20px",
        fontWeight: "bold", // make the font fatter
        fontSize: "2rem",
    }
}))
export const Main = () => {
    // Show token values from the walled
    // Get the addres of different tokens
    // Get the balance of the user wallet

    // send the brownie-config to our 'src' folder
    // send the build folder
    const classes = useStyles()
    const { account, chainId, error } = useEthers()
    const networkName = chainId ? helperConfig[chainId] : "dev"
    console.log(typeof chainId)
    console.log(chainId)
    console.log(account)
    console.log(networkName)

    const isConnected = !!account;
    const isCorrectChain = networks.some(chain => chain.chainId === chainId);
    console.log(isCorrectChain)

    // We need to pull the DAPP token address from the .json file written to by Brownie

    const dapptokenAddress = chainId && isCorrectChain ? networkMapping[String(chainId)]["DappToken"][0] : constants.AddressZero // look into that mapping : 00
    const wethTokenAddress = chainId && isCorrectChain ? brownieConfig["networks"][lowerCaseFirstLetter(networkName)]["weth_token"] : constants.AddressZero //brownie config
    const fauTokenAddress = chainId && isCorrectChain ? brownieConfig["networks"][lowerCaseFirstLetter(networkName)]["fau_token"] : constants.AddressZero

    const supportedTokens: Array<Token> = [
        {
            image: dapp,
            address: dapptokenAddress,
            name: "DAPP",
            decimals: 18
        },
        {
            image: eth,
            address: wethTokenAddress,
            name: "WETH",
            decimals: 18
        },
        {
            image: dai,
            address: fauTokenAddress,
            name: "DAI",
            decimals: 18
        },
    ]


    const [showNetworkError, setShowNetworkError] = useState(false)

    const handleCloseNetworkError = (
        event: React.SyntheticEvent | React.MouseEvent,
        reason?: string
    ) => {
        if (reason === "clickaway") {
            return
        }

        showNetworkError && setShowNetworkError(false)
        console.log(showNetworkError)
    }

    /**
     * useEthers will return a populated 'error' field when something has gone wrong.
     * We can inspect the name of this error and conditionally show a notification
     * that the user is connected to the wrong network.
     */
    useEffect(() => {
        if (!isCorrectChain) {
            !showNetworkError && setShowNetworkError(true)
        } else {
            showNetworkError && setShowNetworkError(false)
        }
    }, [isCorrectChain, showNetworkError])

    return (
        <>
            <Typography
                variant="h2"
                component="h1"
                classes={{
                    root: classes.title,
                }}
            >
                Dapp Token Farm App
            </Typography>
            <Reward token={supportedTokens[0]} />
            <Wallets supportedTokens={supportedTokens} />
            <Snackbar
                open={showNetworkError}
                autoHideDuration={5000}
                onClose={handleCloseNetworkError}
            >
                <Alert onClose={handleCloseNetworkError} severity="warning">
                    You gotta connect to the Goerli or Sepolia network!
                </Alert>
            </Snackbar>
        </>
    )
}