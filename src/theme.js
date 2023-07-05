import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#026c8c",
    },
    secondary: {
      main: "#5FA1B5",
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
