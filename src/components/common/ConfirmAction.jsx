import { useState } from "react";
import { Button, TextField, Typography } from "@mui/material";
import { Lightbox } from "../common/CustomLightbox.jsx";
import { BtnContainer, SubmitBtn } from "./CustomButtons.jsx";

export function ConfirmAction({
  btnLabel,
  children,
  handleAction,
  handleClose,
  open,
  placeholder,
  requireFieldInput,
  submitting,
  title,
}) {
  const [value, setValue] = useState("");
  const handleChange = (e) => setValue(e.target.value);

  if (!requireFieldInput)
    return (
      <Lightbox open={open} onClose={handleClose}>
        <Header title={title} />
        {children}
        <BtnContainer split>
          <CancelButton onClick={handleClose} />
          <SubmitBtn
            disabled={submitting}
            label={btnLabel}
            onClick={handleAction}
            submitting={submitting}
            warning
          />
        </BtnContainer>
      </Lightbox>
    );

  if (requireFieldInput)
    return (
      <Lightbox open={open} onClose={handleClose}>
        <Header title={title} />
        {children}
        <TextField
          fullWidth
          onChange={handleChange}
          value={value}
          placeholder={placeholder}
        />
        <BtnContainer split>
          <CancelButton onClick={handleClose} />
          <SubmitBtn
            // disabled={value !== placeholder}
            label={btnLabel}
            onClick={handleAction}
            // submitting={submitting}
          />
        </BtnContainer>
      </Lightbox>
    );
}

function Header({ title }) {
  return (
    <Typography color="secondary" sx={{ mb: 3 }} variant="h5">
      {title}
    </Typography>
  );
}

function CancelButton({ onClick }) {
  return (
    <Button onClick={onClick} color="secondary">
      CANCEL
    </Button>
  );
}
