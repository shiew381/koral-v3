import { Backdrop, Box, Fade, Modal, Typography } from "@mui/material";

export function Lightbox({
  children,
  open,
  onClose,
  handleKeyUp,
  customStyle,
}) {
  return (
    <Modal
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
      closeAfterTransition
      open={open}
      onClose={onClose}
    >
      <Fade in={open}>
        <Box className="lightbox" onKeyUp={handleKeyUp} sx={customStyle}>
          {children}
        </Box>
      </Fade>
    </Modal>
  );
}

export function LightboxHeader({ title, center }) {
  function pickPlacement() {
    if (center) {
      return "center";
    } else {
      return "left";
    }
  }

  return (
    <Typography
      textAlign={pickPlacement()}
      color="primary"
      sx={{ mb: 2 }}
      variant="h5"
    >
      {title}
    </Typography>
  );
}
