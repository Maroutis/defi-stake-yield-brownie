import React from "react";
import { Slider, Input, Typography, makeStyles, Button } from "@material-ui/core";

interface SliderInputProps {
    label?: string;
    id?: string;
    maxValue: number;
    value: number | string | (string | number)[];
    onChange: (newValue: number | string | Array<number | string>) => void;
    disabled?: boolean;
    [x: string]: any;
}

const useStyles = makeStyles((theme) => ({
    inputsContainer: {
        display: "grid",
        gap: theme.spacing(3),
        gridTemplateRows: "auto",
        gridTemplateColumns: "1fr auto",
    },
    slider: {
        width: 300,
    },
    inputsWrapper: {
        marginTop: "-53px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "130%",
    },
    button: {
        marginLeft: theme.spacing(1),
    }
}));

export const SliderInput = ({
    label = "",
    id = "input-slider",
    maxValue,
    value,
    onChange,
    disabled = false,
    ...rest
}: SliderInputProps) => {
    const handleSliderChange = (event: any, newValue: number | number[]) => {
        onChange(newValue);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value === "" ? "" : Number(event.target.value));
    };

    const handleBlur = () => {
        if (typeof value === "number" && value < 0) {
            onChange(0);
        } else if (typeof value === "number" && value > maxValue) {
            onChange(maxValue);
        }
    };

    const sliderStep = maxValue / 100;
    const inputStep = maxValue / 50;

    const classes = useStyles();

    const sliderMarks = [
        {
            value: 0,
            label: "0%",
        },
        {
            value: maxValue,
            label: "100%",
        },
    ];

    // ... is a "Spread" operator
    // standard javascript thing
    // works on iterables
    // expands a list
    return (
        <div {...rest}>
            {label && (
                <Typography id={id} gutterBottom>
                    {label}
                </Typography>
            )}
            <div className={classes.inputsContainer}>
                <div>
                    <Slider
                        value={typeof value === "number" ? value : 0}
                        className={classes.slider}
                        step={sliderStep}
                        onChange={handleSliderChange}
                        aria-labelledby={id}
                        max={maxValue}
                        disabled={disabled}
                        marks={disabled ?
                            [sliderMarks[0]]
                            : sliderMarks}
                    />
                </div>

                <div className={classes.inputsWrapper}>
                    <Input
                        value={value}
                        margin="dense"
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        disabled={disabled}
                        inputProps={{
                            step: inputStep,
                            min: 0,
                            max: maxValue,
                            type: "number",
                            "aria-labelledby": id,
                        }}
                    />
                    <Button
                        className={classes.button}
                        variant="outlined"
                        color="primary"
                        disabled={disabled}
                        onClick={() => onChange(maxValue)}>
                        Max
                    </Button>
                </div>

            </div>
        </div>
    );
};