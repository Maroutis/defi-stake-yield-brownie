import { Token } from "./Main"
import { Box } from "@material-ui/core"
import { TabContext, TabList, TabPanel } from "@material-ui/lab"
import React, { useState } from "react"
import { Tab } from "@material-ui/core"
import { WalletBalance } from "./yourWallet"
import { StakeForm } from "./yourWallet/StakeForm"
import { TokenFarmWalletBalance } from "./tokenFarmWallet"
import { UnStakeForm } from "./tokenFarmWallet"
import { makeStyles } from "@material-ui/core"
import { classicNameResolver } from "typescript"
import { Divider } from "@material-ui/core";
import { ReinvestRewardForm } from "./tokenFarmWallet"
import { AddToMetamaskButton } from "./yourWallet"
import { Tooltip } from "@material-ui/core";
import { InfoOutlined } from "@material-ui/icons";


interface WalletProps {
    supportedTokens: Array<Token>
}

const useStyles = makeStyles((theme) => ({
    tabContent: {
        display: "flex",
        flexDirection: "row",
        gap: theme.spacing(4),
        width: "100%",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    tabList: {
        backgroundColor: "black",
        height: "2px",
        borderRadius: "10px",
    },
    box: {
        backgroundColor: "white",
        borderRadius: "1px",
        border: `1px solid ${theme.palette.primary.dark}`,
        padding: 0,
        margin: 0,
        marginTop: 0,
        marginBottom: theme.spacing(2),
        boxSizing: "border-box",  // include padding and border in width calculation
        width: "100%",  // modify the width of the entire box
        [theme.breakpoints.up("sm")]: {
            width: "120%",
            marginLeft: "-10%",
        },
    },
    line: {
        width: "4px",
        background: "linear-gradient(135deg, hsl(227, 61%, 13%), hsl(227, 61%, 26%), hsl(227, 61%, 39%))",
        borderRadius: "10px",
    },
    tokenLine: {
        position: 'absolute',
        top: '295px',
        width: '100%',
        height: '1px',
        background: 'linear-gradient(to right, #ccc, #ccc 100%, transparent 100%, transparent 100%, #ccc 100%)',
        transform: 'translateY(50%)',
        [theme.breakpoints.up("sm")]: {
            width: "85.3%",
        },
    },
    section: {
        flex: "1 1 0px",
        fontSize: "20px",
        padding: "0 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonReinvest: {
        marginLeft: "auto",
        padding: 0,
        marginRight: "10px",
        marginTop: 0,
    },
    top: {
        padding: 0,
        marginTop: "-22px",
        Top: 0,
        display: "flex",
        alignItems: "center"
    },
    infoTooltip: {
        padding: "0",
        position: "relative",
        marginRight: "50px",

    },
    buttonAdd: {
        marginRight: "auto",
        marginTop: "10px",
        marginLeft: "-30px",
    }
}));

export const Wallets = ({ supportedTokens }: WalletProps) => {
    const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(0)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setSelectedTokenIndex(parseInt(newValue))
    }
    const informationString = `Your reward will be staked in DAPP`;
    const classes = useStyles()

    return (
        <Box>
            <Box className={classes.box}>
                <div className={classes.tokenLine}></div>
                <TabContext value={selectedTokenIndex.toString()}>
                    <div className={classes.top} >
                        <TabList
                            onChange={handleChange}
                            aria-label="stake/unstake form tabs">
                            {supportedTokens.map((token, index) => {
                                return (
                                    <Tab
                                        label={token.name}
                                        value={index.toString()}
                                        key={index}
                                    />
                                );
                            })}
                        </TabList>
                        <div className={classes.buttonReinvest}>
                            <ReinvestRewardForm />
                        </div>
                        <Tooltip title={informationString} arrow>
                            <InfoOutlined className={classes.infoTooltip} color="primary" fontSize="small" />
                        </Tooltip>
                    </div>
                    {supportedTokens.map((token, index) => {
                        return (
                            <TabPanel value={index.toString()} key={index}>
                                <div className={classes.tabContent} style={{ display: "flex" }}>
                                    <div className={classes.section}>
                                        <WalletBalance token={supportedTokens[selectedTokenIndex]} />
                                        <StakeForm token={supportedTokens[selectedTokenIndex]} />
                                        <div className={classes.buttonAdd} >
                                            <AddToMetamaskButton token={supportedTokens[selectedTokenIndex]} />
                                        </div>
                                    </div>
                                    <Divider className={classes.line} orientation="vertical" flexItem />
                                    <div className={classes.section}>
                                        <TokenFarmWalletBalance token={supportedTokens[selectedTokenIndex]} />
                                        <UnStakeForm token={supportedTokens[selectedTokenIndex]} />
                                    </div>
                                </div>
                            </TabPanel>
                        );
                    })}
                </TabContext>
            </Box>
        </Box>
    )

}