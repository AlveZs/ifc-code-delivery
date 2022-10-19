import { DriveEta } from "@mui/icons-material";
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { FunctionComponent } from "react";

export const Navbar: FunctionComponent = () => {
  return (
    <AppBar position="static" enableColorOnDark>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <DriveEta />
        </IconButton>
        <Typography variant="h6">Code Delivery</Typography>
      </Toolbar>
    </AppBar>
  );
};