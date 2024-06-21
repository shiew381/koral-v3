import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#27708e",
    },
    secondary: {
      main: "#0FA8CB",
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
