import { CardContent, Link, Typography } from "@mui/material";

export default function Multipart() {
  return (
    <CardContent>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <Typography align="center">
        Support for multipart questions is not available on Koral v3 yet.
      </Typography>
      <br />
      <br />
      <div className="flex flex-row flex-center">
        <Typography display="inline" sx={{ mx: 1 }}>
          Visit
        </Typography>
        <Link
          display="inline"
          href="https://koral.community"
          target="_blank"
          underline="hover"
          sx={{ position: "relative", bottom: "1px" }}
        >
          Koral v1
        </Link>
        <Typography align="center" display="inline" sx={{ mx: 1 }}>
          to view this question
        </Typography>
      </div>
    </CardContent>
  );
}
