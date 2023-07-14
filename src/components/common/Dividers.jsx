import { Typography } from "@mui/material";

export function VertDivider({ hidden }) {
  if (hidden) {
    return null;
  }

  return (
    <Typography display="inline" sx={{ mx: 2 }}>
      |
    </Typography>
  );
}
