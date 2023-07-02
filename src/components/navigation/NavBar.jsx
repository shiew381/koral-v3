import { AppBar, IconButton, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation } from "react-router-dom";

export function NavBar({ handleOpen }) {
  const location = useLocation();
  const homePage = location.pathname === "/";

  if (homePage) return null;

  return (
    <AppBar>
      <Toolbar className="flex flex-space-between">
        <IconButton onClick={handleOpen} color="inherit">
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
