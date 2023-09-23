import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  AppBar,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export function NavBar({ handleOpen }) {
  const [anchor, setAnchor] = useState(null);

  const anchorUserMenu = (e) => setAnchor(e.currentTarget);
  const closeUserMenu = () => setAnchor(null);

  const location = useLocation();
  const homePage = location.pathname === "/";

  if (homePage) return null;

  return (
    <AppBar>
      <Toolbar className="flex flex-space-between">
        <IconButton onClick={handleOpen} color="inherit">
          <MenuIcon />
        </IconButton>
        <IconButton onClick={anchorUserMenu} size="large" color="inherit">
          <AccountCircleIcon />
        </IconButton>
        <UserAccountMenu anchor={anchor} handleClose={closeUserMenu} />
      </Toolbar>
    </AppBar>
  );
}

function UserAccountMenu({ anchor, handleClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <Menu
      anchorEl={anchor}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(anchor)}
      onClose={handleClose}
      sx={{ mt: 5 }}
    >
      <MenuItem onClick={handleClose}>
        <ListItemText
          onClick={() => {
            handleClose();
            navigate("account");
          }}
        >
          My account
        </ListItemText>
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleClose();
          logout();
          navigate("/");
        }}
      >
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );
}
