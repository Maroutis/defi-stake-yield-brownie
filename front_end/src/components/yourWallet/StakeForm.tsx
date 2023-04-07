import React, { useEffect, useState } from "react"
import { Token } from "../Main"
import { useEthers, useTokenBalance, useNotifications } from "@usedapp/core"
import { formatUnits } from "@ethersproject/units"
import Alert from "@material-ui/lab/Alert"
import { useStakeTokens } from "../../hooks"
import { SliderInput } from "../../components/SliderInput"
import { utils } from "ethers"
import {
    Button,
    CircularProgress,
    Snackbar,
    makeStyles,
} from "@material-ui/core"
import { classicNameResolver } from "typescript"

export interface StakeFormProps {
    token: Token
}

const useStyles = makeStyles((theme) => ({
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: theme.spacing(0),
        width: "100%",
    },
    slider: {
        width: "450px",
        margin: "25px 0",
    },
    button: {
        margin: "-20px 0",
        marginLeft: "30px"
    },
}))

export const StakeForm = ({ token }: StakeFormProps) => {
    const { address: tokenAddress, name } = token
    const { account } = useEthers()
    const tokenBalance = useTokenBalance(tokenAddress, account)
    const formattedTokenBalance: number = tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)) : 0
    const { notifications } = useNotifications()
    const classes = useStyles()

    const [amount, setAmount] = useState<number | string | Array<number | string>>(0)
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = event.target.value === "" ? "" : Number(event.target.value)
        setAmount(newAmount)
        console.log(newAmount)
    }

    const { approveAndStake, state: approveAndStakeErc20State } = useStakeTokens(tokenAddress)
    const handleStakeSubmit = () => {
        const amountAsWei = utils.parseEther(amount.toString())
        return approveAndStake(amountAsWei.toString())
    }

    const isMining = approveAndStakeErc20State.status === "Mining"
    const hasZeroBalance = formattedTokenBalance === 0
    const hasZeroAmountSelected = parseFloat(amount.toString()) === 0

    const [showErc20ApprovalSuccess, setShowErc20ApprovalSuccess] = useState(false)
    const [showStakeTokenSuccess, setStakeTokenSuccess] = useState(false)
    const handleCloseSnack = () => {
        setShowErc20ApprovalSuccess(false)
        setStakeTokenSuccess(false)
    }

    useEffect(() => {
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Approve ERC20 transfer").length > 0
        ) {
            setShowErc20ApprovalSuccess(true)
            setStakeTokenSuccess(false)
        }
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Stake Tokens").length > 0
        ) {
            setShowErc20ApprovalSuccess(false)
            setStakeTokenSuccess(true)
        }
    }, [notifications, showErc20ApprovalSuccess, showStakeTokenSuccess])

    return (
        <>
            <div className={classes.container}>
                <SliderInput
                    maxValue={formattedTokenBalance}
                    id={`slider-input-${name}`}
                    className={classes.slider}
                    value={amount}
                    onChange={setAmount}
                    disabled={isMining || hasZeroBalance}
                />
                <Button
                    onClick={handleStakeSubmit}
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    size="large"
                    disabled={isMining || hasZeroAmountSelected || hasZeroBalance}>
                    {isMining ? <CircularProgress size={26} /> : "Stake"}
                </Button>
            </div>
            <Snackbar
                open={showErc20ApprovalSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}>
                <Alert onClose={handleCloseSnack} severity="success">
                    ERC-20 token transfer Approved! Now approve the 2nd transaction.
                </Alert>
            </Snackbar>
            <Snackbar
                open={showStakeTokenSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}>
                <Alert onClose={handleCloseSnack} severity="success">
                    Tokens Staked!
                </Alert>
            </Snackbar>


        </>
    )
}