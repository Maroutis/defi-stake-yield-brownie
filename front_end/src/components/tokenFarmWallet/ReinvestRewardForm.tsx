import React, { useEffect, useState } from "react"
import { Token } from "../Main"
import { useEthers, useTokenBalance, useNotifications } from "@usedapp/core"
import { Button, Input, CircularProgress, Snackbar, makeStyles } from "@material-ui/core"
import Alert from "@material-ui/lab/Alert"
import { useReinvestAccruedReward } from "../../hooks"
import { useGetUserAccruedReward } from "../../hooks"
import { formatUnits } from "@ethersproject/units"

export interface UnStakeFormProps {
    token: Token
}

const useStyles = makeStyles((theme) => ({
    button: {
        margin: "25px 0",
    },
}))

export const ReinvestRewardForm = () => {
    const { account } = useEthers()
    const { notifications } = useNotifications()
    const classes = useStyles()

    const tokenReward = useGetUserAccruedReward(account)?.toString()
    const formattedTokenReward: number =
        tokenReward ?
            parseFloat(formatUnits(tokenReward, 18)) :
            0;
    const hasZeroBalanceReward = formattedTokenReward == 0

    const { Reinvest, ReinvestState: ReinvestState } = useReinvestAccruedReward()
    const handleUnStakeSubmit = () => {
        return Reinvest()
    }

    const isMining = ReinvestState.status === "Mining"
    const [showReinvestStateSuccess, setReinvestStateSuccess] = useState(false)
    const handleCloseSnack = () => {
        setReinvestStateSuccess(false)
    }

    useEffect(() => {
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Reinvest Accrued Reward").length > 0
        ) {
            setReinvestStateSuccess(true)
        }
    }, [notifications, showReinvestStateSuccess])
    return (
        <>
            <div>
                <Button
                    onClick={handleUnStakeSubmit}
                    className={classes.button}
                    color="primary"
                    size="large"
                    variant="contained"
                    disabled={isMining || hasZeroBalanceReward}>
                    {isMining ? <CircularProgress size={26} /> : `Reinvest Reward`}
                </Button>
            </div>
            <Snackbar
                open={showReinvestStateSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}>
                <Alert onClose={handleCloseSnack} severity="success">
                    Reward Reinvested in DAPP !
                </Alert>
            </Snackbar>

        </>
    )
}