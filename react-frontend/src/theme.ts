import { createTheme, ThemeOptions } from "@mui/material";

const palette: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#FFCD00",
      contrastText: "#242526"
    },
    background: {
      default: "#242526"
    },
  }
};


const theme = createTheme(palette);

export default theme;