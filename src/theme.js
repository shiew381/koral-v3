import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#176D6A",
    },
    secondary: {
      main: "#009B97",
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
