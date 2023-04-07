import React, { useEffect, useState } from "react"
import { Token } from "../Main"
import { useEthers, useTokenBalance, useNotifications } from "@usedapp/core"
import { Button, Input, CircularProgress, Snackbar, makeStyles } from "@material-ui/core"
import Alert from "@material-ui/lab/Alert"
import { useUnStakeTokens } from "../../hooks"
import { useGetStakingBalance } from "../../hooks"
import { formatUnits } from "@ethersproject/units"

export interface UnStakeFormProps {
    token: Token
}

const useStyles = makeStyles((theme) => ({
    button: {
        margin: "25px 0",
    },
}))

export const UnStakeForm = ({ token }: UnStakeFormProps) => {
    const { address: tokenAddress, name } = token
    const { account } = useEthers()
    const { notifications } = useNotifications()
    const classes = useStyles()
    const tokenBalance = useGetStakingBalance(tokenAddress, account)?.toString()
    const formattedTokenBalance: number =
        tokenBalance ?
            parseFloat(formatUnits(tokenBalance, 18)) :
            0;
    const hasZeroBalanceStaked = formattedTokenBalance == 0

    const { UnStake, UnStakeState: UnStakeState } = useUnStakeTokens(tokenAddress)
    const handleUnStakeSubmit = () => {
        return UnStake()
    }

    const isMining = UnStakeState.status === "Mining"
    const [showUnStakeStateSuccess, setUnStakeStateSuccess] = useState(false)
    const handleCloseSnack = () => {
        setUnStakeStateSuccess(false)
    }

    useEffect(() => {
        if (notifications.filter(
            (notification) =>
                notification.type === "transactionSucceed" &&
                notification.transactionName === "Unstake Tokens").length > 0
        ) {
            setUnStakeStateSuccess(true)
        }
    }, [notifications, showUnStakeStateSuccess])
    return (
        <>
            <div>
                <Button
                    onClick={handleUnStakeSubmit}
                    className={classes.button}
                    color="primary"
                    size="large"
                    variant="contained"
                    disabled={isMining || hasZeroBalanceStaked}>
                    {isMining ? <CircularProgress size={26} /> : `UNSTAKE ALL ${name}`}
                </Button>
            </div>
            <Snackbar
                open={showUnStakeStateSuccess}
                autoHideDuration={5000}
                onClose={handleCloseSnack}>
                <Alert onClose={handleCloseSnack} severity="success">
                    Tokens Unstaked !
                </Alert>
            </Snackbar>

        </>
    )
}