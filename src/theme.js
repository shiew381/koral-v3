import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#026c8c",
    },
    secondary: {
      main: "#3a3a3a",
      light: "#e0e0e0",
      dark: "#e0e0e0",
      contrastText: "#e0e0e0",
    },
    warning: {
      main: "#A02E2E",
    },
    text: { success: "#008F45", error: "#AD343E" },
    typography: {
      fontFamily: "Lato",
    },
  },
});
