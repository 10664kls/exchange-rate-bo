"use client";

import type React from "react";

import { TextField, type TextFieldProps } from "@mui/material";
import { useCallback } from "react";

interface FormattedNumberInputProps
  extends Omit<TextFieldProps, "value" | "onChange"> {
  value: string | number;
  onChange: (value: string, numericValue: number) => void;
  allowDecimals?: boolean;
  maxDecimals?: number;
  prefix?: string;
  suffix?: string;
}

const FormattedNumberInput = ({
  value,
  onChange,
  allowDecimals = true,
  maxDecimals = 2,
  prefix = "",
  suffix = "",
  ...textFieldProps
}: FormattedNumberInputProps) => {
  // Format number with commas
  const formatNumber = useCallback(
    (num: string): string => {
      // Remove all non-numeric characters except decimal point
      const cleanNum = num.replace(/[^\d.]/g, "");

      if (!cleanNum) return "";

      // Handle decimal places
      const parts = cleanNum.split(".");
      let integerPart = parts[0];
      let decimalPart = parts[1] || "";

      // Limit decimal places
      if (allowDecimals && decimalPart.length > maxDecimals) {
        decimalPart = decimalPart.substring(0, maxDecimals);
      }

      // Add commas to integer part
      integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

      // Combine parts
      let formatted = integerPart;
      if (allowDecimals && (decimalPart || cleanNum.includes("."))) {
        formatted += "." + decimalPart;
      }

      return formatted;
    },
    [allowDecimals, maxDecimals]
  );

  // Get numeric value without formatting
  const getNumericValue = useCallback((formattedValue: string): number => {
    const cleanValue = formattedValue.replace(/[^\d.]/g, "");
    return Number.parseFloat(cleanValue) || 0;
  }, []);

  // Get display value with prefix/suffix
  const getDisplayValue = useCallback(
    (val: string | number): string => {
      const stringVal = typeof val === "number" ? val.toString() : val;
      const formatted = formatNumber(stringVal);
      return `${prefix}${formatted}${suffix}`;
    },
    [formatNumber, prefix, suffix]
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    // Remove prefix and suffix for processing
    let cleanInput = inputValue;
    if (prefix) cleanInput = cleanInput.replace(prefix, "");
    if (suffix) cleanInput = cleanInput.replace(suffix, "");

    // Format the number
    const formatted = formatNumber(cleanInput);
    const numericValue = getNumericValue(formatted);

    // Call parent onChange with both formatted and numeric values
    onChange(formatted, numericValue);
  };

  return (
    <TextField
      {...textFieldProps}
      value={getDisplayValue(value)}
      onChange={handleChange}
      slotProps={{
        htmlInput: {
          inputMode: "numeric",
          pattern: allowDecimals ? "[0-9,]*\\.?[0-9]*" : "[0-9,]*",
          ...textFieldProps.slotProps?.htmlInput,
        },
      }}
    />
  );
};

export default FormattedNumberInput;
