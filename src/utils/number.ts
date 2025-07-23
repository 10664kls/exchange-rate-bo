// Utility functions for number handling

/**
 * Removes commas and formatting from a number string for API submission
 * @param value - The formatted number string (e.g., "1,500.00" or "USD 1,500")
 * @returns Clean numeric value (e.g., 1500)
 */
export const cleanNumberForAPI = (value: string | number): number => {
  if (typeof value === "number") return value

  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, "")
  const numericValue = Number.parseFloat(cleaned) || 0

  return numericValue
}


/**
 * Validates if a string represents a valid number
 * @param value - The string to validate
 * @returns boolean indicating if it's a valid number
 */
export const isValidNumber = (value: string): boolean => {
  const cleaned = cleanNumberForAPI(value)
  return !isNaN(cleaned) && cleaned > 0
}


/**
 * Formats a given number according to the locale conventions of the
 * user's browser. The number will be formatted as a decimal with two
 * maximum fraction digits. This function is useful for displaying
 * currency values, for example.
 *
 * @param {number} amount - The number to format
 * @returns {string} A string representation of the number, formatted
 *   according to the locale conventions of the user's browser
 */
export const formatNumber = (
  amount: number,
) => {
  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: 2,
    style: "decimal",
  };

  return new Intl.NumberFormat("en-US", options).format(amount);
};