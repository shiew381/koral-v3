import { Popover, List, ListItem } from "@mui/material";

export function MoreOptionsMenu({ open, anchorEl, handleClose, children }) {
  const anchorPlacement = {
    vertical: "center",
    horizontal: "center",
  };

  const originPlacement = {
    vertical: "top",
    horizontal: "left",
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={anchorPlacement}
      transformOrigin={originPlacement}
    >
      <List disablePadding>{children}</List>
    </Popover>
  );
}

export function MenuOption({ children }) {
  return <ListItem disablePadding>{children}</ListItem>;
}
