import { createTheme } from "@mui/material";
import type {} from "@mui/material/themeCssVarsAugmentation";
import "@fontsource-variable/noto-sans-lao/wdth.css";

const AppTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#27272a",
        },
        grey: {
          "50": "#fafafa",
          "100": "#f5f5f5",
          "200": "#e5e5e5",
          "300": "#d4d4d4",
          "400": "#a3a3a3",
          "500": "#737373",
          "600": "#525252",
          "700": "#404040",
          "800": "#262626",
          "900": "#171717",
        },
        background: {
          default: "#f5f5f5",
        },
      },
    },
    dark: {
      palette: {
        grey: {
          "50": "#fafafa",
          "100": "#f5f5f5",
          "200": "#e5e5e5",
          "300": "#d4d4d4",
          "400": "#a3a3a3",
          "500": "#737373",
          "600": "#525252",
          "700": "#404040",
          "800": "#262626",
          "900": "#171717",
        },
        background: {
          default: "#000",
        },
      },
    },
  },
  typography: {
    fontFamily: "Noto Sans Lao Variable, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          variants: [
            {
              props: { variant: "contained", color: "primary" },
              style: {
                "--_shadow": "#000",
                border: `0px solid ${
                  (theme.vars || theme).palette.primary.main
                }`,
                boxShadow: `inset -0.75px -0.75px 0.75px var(--_shadow), inset 0.75px 0.75px 0.75px rgba(255, 255, 255, 0.4)`,
                backgroundImage: `linear-gradient(to bottom, ${
                  (theme.vars || theme).palette.primary.light
                }, ${(theme.vars || theme).palette.primary.main})`,
                backgroundColor: (theme.vars || theme).palette.primary.light,
                "&:hover": {
                  boxShadow: `inset -0.75px -1px 0.75px var(--_shadow), inset 0.75px 0 0.75px rgba(255, 255, 255, 0.4)`,
                  backgroundImage: "none",
                },
                "&:active": {
                  boxShadow: "none",
                },
                ...theme.applyStyles("dark", {
                  "--_shadow": "#1876c2",
                  borderColor: "#467297",
                  backgroundColor: (theme.vars || theme).palette.primary.dark,
                  backgroundImage: `linear-gradient(to bottom, ${
                    (theme.vars || theme).palette.primary.main
                  }, ${(theme.vars || theme).palette.primary.dark})`,
                }),
              },
            },
            {
              props: { variant: "outlined", color: "primary" },
              style: {
                borderColor: (theme.vars || theme).palette.grey[300],
                "&:hover": {
                  borderColor: (theme.vars || theme).palette.grey[400],
                },
                ...theme.applyStyles("dark", {
                  borderColor: (theme.vars || theme).palette.grey[700],
                  "&:hover": {
                    borderColor: (theme.vars || theme).palette.grey[600],
                  },
                }),
              },
            },
          ],
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& fieldset": {
            borderColor: (theme.vars || theme).palette.grey[300],
          },
          "& .MuiOutlinedInput-root:not(.Mui-focused):hover fieldset": {
            borderColor: (theme.vars || theme).palette.grey[400],
          },
          ...theme.applyStyles("dark", {
            "& fieldset": {
              borderColor: (theme.vars || theme).palette.grey[700],
            },
            "& .MuiOutlinedInput-root:not(.Mui-focused):hover fieldset": {
              borderColor: (theme.vars || theme).palette.grey[600],
            },
          }),
        }),
      },
    },
  },
});

export default AppTheme;
