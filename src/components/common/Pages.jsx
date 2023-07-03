import { CircularProgress, Typography } from "@mui/material";

export function Page({ children }) {
  return <div className="page-container">{children}</div>;
}

export function PageHeader({ title }) {
  return (
    <Typography sx={{ p: 2 }} variant="h3" color="primary">
      {title}
    </Typography>
  );
}

export function LoadingIndicator() {
  return (
    <div className="flex flex-center" style={{ height: "50vh" }}>
      <CircularProgress />
    </div>
  );
}
