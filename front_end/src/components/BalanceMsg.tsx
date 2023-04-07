import { makeStyles } from "@material-ui/core"

const useStyles = makeStyles(theme => ({
    container: {
        display: "inline-grid",
        gridTemplateColumns: "auto auto auto",
        gap: theme.spacing(1),
        alignItems: "center",
        fontWeight: 700,
    },
    tokenImg: {
        width: "32px"
    },
    amount: {
        fontWeight: 700
    },
    label: {
        gridRow: 1,
    },
}))

interface BalanceMsgProps {
    label: string
    amount: number
    tokenImgSrc: string
}

export const BalanceMsg = ({ label, amount, tokenImgSrc }: BalanceMsgProps) => {
    const classes = useStyles()

    return (
        <div className={classes.container}>
            <div className={classes.label}>{label}</div>
            <div className={classes.amount}>{amount.toFixed(4)}</div>
            <img className={classes.tokenImg} src={tokenImgSrc} alt="token logo" />
        </div>
    )
}