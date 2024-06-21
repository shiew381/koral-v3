import { Button, Typography } from "@mui/material";
import { BtnContainer } from "./Buttons";
import AddIcon from "@mui/icons-material/Add";

export function BuildFirstItem({ handleOpen, item, message }) {
  return (
    <div
      className="flex flex-center"
      style={{ height: "50vh", padding: "20px" }}
    >
      <div>
        <Typography align="center" color="primary" variant="h6">
          {message}
        </Typography>
        <br />
        <BtnContainer center>
          <Button
            fullWidth
            color="secondary"
            onClick={handleOpen}
            size="large"
            startIcon={<AddIcon />}
            sx={{ p: 2 }}
            variant="outlined"
          >
            New {item}
          </Button>
        </BtnContainer>
      </div>
    </div>
  );
}
