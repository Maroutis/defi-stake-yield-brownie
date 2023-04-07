import { Token } from "../Main";
import { useGetUserAccruedReward } from "../../hooks";
import { useEthers } from "@usedapp/core";
import { useGetUserTVL } from "../../hooks";
import { useGetAPR } from "../../hooks";
import { formatUnits } from "@ethersproject/units"
import { Tooltip } from "@material-ui/core";
import { InfoOutlined } from "@material-ui/icons";
import { makeStyles, ThemeProvider } from "@material-ui/core"
import { classicNameResolver } from "typescript"


const useStyles = makeStyles((theme) => ({
    box: {
        backgroundColor: "white",
        borderRadius: "1px",
        border: `1px solid ${theme.palette.primary.dark}`,
        padding: 0,
        marginBottom: theme.spacing(2),
        boxSizing: "border-box",  // include padding and border in width calculation
        width: "120%",  // modify the width of the entire box
        marginLeft: "-10%",  // offset the overflowing width to the left
    },
    content: {
        backgroundColor: "white",
        borderRadius: "25px",
        padding: "8px",
        display: "flex",
    },
    section: {
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        display: "inline-flex",
        flex: "1 1 0px",
        fontSize: "20px",
        padding: "0 16px",
    },
    line: {
        width: "4px",
        background: "linear-gradient(135deg, hsl(227, 61%, 13%), hsl(227, 61%, 26%), hsl(227, 61%, 39%))",
        borderRadius: "10px",
    },
    amount: {
        fontWeight: 700,
        fontSize: "28px",
    },
    tokenImg: {
        height: "30px",
        width: "auto",
        position: "relative",
        top: "4px",
        marginLeft: "8px"
    },
    infoTooltip: {
        padding: "0",
        position: "relative",
        top: "1px",
        right: "-3px",
    },
    header: {
    },
}));

export interface RewardProps {
    token: Token | undefined;
}

export const Reward = ({ token }: RewardProps) => {
    const { account } = useEthers();
    const myTVL = useGetUserTVL(account);
    const apr = useGetAPR();
    const myReward = useGetUserAccruedReward(account);

    const myTVLFormatted: number = myTVL ? parseFloat(formatUnits(myTVL, 18)) : 0
    const myAPRFormatted: number = apr ? parseFloat(formatUnits(apr, 2)) : 0
    const myRewardFormatted: number = myReward ? parseFloat(formatUnits(myReward, 18)) : 0

    const informationString = `Earn ${myAPRFormatted}% on your TVL in DAPP!`;
    const classes = useStyles()

    return (
        <div className={classes.box}>
            <div className={classes.content}>
                <div className={classes.section}>
                    <div className={classes.header}>Your TVL</div>
                    <div className={classes.amount}>${myTVLFormatted.toFixed(2)}</div>
                </div>
                <div className={classes.line}></div>
                <div className={classes.section}>
                    <div className={classes.header}>APR</div>
                    <div className={classes.amount}>{myAPRFormatted}%</div>
                </div>
                <div className={classes.line}></div>
                <div className={classes.section}>
                    {token ?
                        <>
                            <div style={{ display: "inline-flex", alignItems: "center" }} >
                                <div className={classes.header}>Your Reward</div>
                                <div className={classes.infoTooltip}>
                                    <Tooltip title={informationString} placement="right" arrow>
                                        <InfoOutlined className={classes.infoTooltip} color="primary" fontSize="small" />
                                    </Tooltip>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div className={classes.amount} >
                                    {myRewardFormatted.toFixed(6)}</div>
                                <img className={classes.tokenImg} src={token.image} alt="token logo" />
                            </div>
                        </>
                        :
                        <header>An error occured</header>
                    }
                </div>
            </div>
        </div >
    );
}