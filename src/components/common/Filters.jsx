import {
  Chip,
  Dialog,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";

export function FilterActions({ children }) {
  return (
    <div className="filter-actions">
      <Typography
        sx={{ paddingLeft: "15px", paddingRight: "10px" }}
        color="text.secondary"
      >
        filter by:
      </Typography>
      {children}
    </div>
  );
}

export function FilterChip({ filter, label, handleOpen, setFilter }) {
  if (filter === "") {
    return (
      <Chip
        color="secondary"
        label={`all ${label}s`}
        variant="outlined"
        onClick={handleOpen}
        size="small"
        sx={{ mr: "10px", mb: "4px", mt: "4px" }}
      />
    );
  } else {
    return (
      <Chip
        color="secondary"
        label={filter}
        variant="contained"
        onDelete={() => setFilter("")}
        size="small"
        sx={{ mr: "10px", mb: "4px", mt: "4px" }}
      />
    );
  }
}

export function FilterMenu({ label, open, handleClose, handleSelect, items }) {
  if (items.length === 0) {
    return (
      <Dialog onClose={handleClose} open={open}>
        <div style={{ minWidth: "300px", padding: "10px" }}>
          <div style={{ paddingLeft: "15px", paddingRight: "15px" }}>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ paddingBottom: "5px", paddingTop: "10px" }}
            >
              no {label.toLowerCase()}s to filter by
            </Typography>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <div style={{ minWidth: "300px", padding: "10px" }}>
        <div style={{ paddingLeft: "15px", paddingRight: "15px" }}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ paddingBottom: "5px", paddingTop: "10px" }}
          >
            filter by {label}
          </Typography>
          <Divider />
        </div>

        <List dense sx={{ pt: 0 }}>
          {items.map((inst) => (
            <ListItem disableGutters key={inst}>
              <ListItemButton onClick={() => handleSelect(inst)}>
                <ListItemText primary={inst} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>
    </Dialog>
  );
}
