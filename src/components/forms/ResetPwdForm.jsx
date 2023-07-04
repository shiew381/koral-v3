import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Alert } from "@mui/material";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { EmailField } from "../common/InputFields.jsx";
import { authErrorMessage } from "../../utils/errorMsgs.js";

export function ResetPwdForm({ open, handleClose }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleEmail = (e) => setEmail(e.target.value);

  function resetForm() {
    setEmail("");
    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleSubmit() {
    const message =
      "A link to reset your passward was sent to your email. If it's not in your inbox, remember to check your spam folder!";

    setErrorMessage("");
    setSubmitting(true);

    resetPassword(email)
      .then(() => {
        setTimeout(() => {
          setSubmitting(false);
          setSuccessMessage(message);
        }, 500);
        setTimeout(() => handleClose(), 4000);
      })
      .catch((error) => {
        console.log(error);
        setTimeout(() => setSubmitting(false), 500);
        setTimeout(() => setErrorMessage(authErrorMessage(error.code)), 600);
      });
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose}>
      <LightboxHeader title="Reset Password" center />
      <EmailField onChange={handleEmail} value={email} />
      {errorMessage && <Alert severity="warning">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <BtnContainer right>
        <SubmitBtn
          disabled={submitting}
          label="RESET PASSWORD"
          submitting={submitting}
          onClick={handleSubmit}
        />
      </BtnContainer>
    </Lightbox>
  );
}
