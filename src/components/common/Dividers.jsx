import { Typography } from "@mui/material";

export function VertDivider({ hidden }) {
  if (hidden) {
    return null;
  }

  return (
    <Typography
      color="text.secondary"
      display="inline"
      sx={{ mx: 2, fontSize: "20px" }}
    >
      |
    </Typography>
  );
}
