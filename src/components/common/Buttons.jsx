import { Box, Button, CircularProgress, IconButton } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export function SubmitBtn({ disabled, fullWidth, onClick, submitting, label }) {
  return (
    <Button
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={onClick}
      variant="contained"
      sx={{ minWidth: "130px", color: "#FFEDDE" }}
    >
      {submitting ? (
        <CircularProgress size={25} sx={{ mx: 3, color: "#FFEDDE" }} />
      ) : (
        label
      )}
    </Button>
  );
}

export function BtnContainer({ children, left, center, right, split }) {
  let placement;

  if (left) placement = "flex-start";
  if (center) placement = "flex-justify-center";
  if (right) placement = "flex-end";
  if (split) placement = "flex-space-between";

  return <Box className={`flex flex-row ${placement}`}>{children}</Box>;
}

export function MoreOptionsBtn({ setSelImage, image, setAnchorEl }) {
  return (
    <IconButton
      sx={{ position: "absolute", bottom: 10, right: 5 }}
      onClick={(e) => {
        setAnchorEl(e.currentTarget);
        setSelImage(image);
      }}
    >
      <MoreVertIcon />
    </IconButton>
  );
}
