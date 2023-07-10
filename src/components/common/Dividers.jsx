import { Typography } from "@mui/material";

export function VertDivider({ question, show }) {
  const hidden =
    !question?.attemptsPossible || question?.type === "free response";

  if (show) {
    return (
      <Typography display="inline" sx={{ mx: 2 }}>
        |
      </Typography>
    );
  }

  if (hidden) {
    return null;
  }

  return (
    <Typography display="inline" sx={{ mx: 2 }}>
      |
    </Typography>
  );
}
