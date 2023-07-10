import { Box, Button, Typography } from "@mui/material";
import { BtnContainer } from "./Buttons";
import AddIcon from "@mui/icons-material/Add";

export function BuildFirstItem({ handleOpen, item, message }) {
  return (
    <Box className="build-first-item">
      <Typography align="center" color="primary" variant="h6">
        {message}
      </Typography>
      <br />
      <BtnContainer center>
        <Button onClick={handleOpen} size="large" startIcon={<AddIcon />}>
          New {item}
        </Button>
      </BtnContainer>
    </Box>
  );
}
