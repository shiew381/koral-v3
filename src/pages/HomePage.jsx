import { useState } from "react";
import { Box, Link, Stack, Typography } from "@mui/material";
import { SignUpForm } from "../components/forms/SignUpForm";
import { EmailField, PasswordField } from "../components/common/InputFields";
import { ResetPwdForm } from "../components/forms/ResetPwdForm";

export default function HomePage() {
  const imgURL = import.meta.env.VITE_HOME_PAGE_IMG;

  const [signupOpen, setSignupOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // const [submitting, setSubmitting] = useState(false);
  // const [errorMessage, setErrorMessage] = useState("");

  function handleEmail(e) {
    setEmail(e.target.value);
  }

  function handlePassword(e) {
    setPassword(e.target.value);
  }

  function openSignup() {
    setSignupOpen(true);
  }

  function closeSignup() {
    setSignupOpen(false);
  }

  function openResetPwd() {
    setResetOpen(true);
  }

  function closeResetPwd() {
    setResetOpen(false);
  }

  return (
    <Box height="100vh" className="flex flex-center">
      <Box className="flex flex-center flex-wrap">
        <img src={imgURL} alt="app logo" width="300px" />
        <Box width="300px" sx={{ mx: 3 }}>
          <EmailField onChange={handleEmail} value={email} />
          <PasswordField onChange={handlePassword} value={password} />
          <Link
            className="block text-center link"
            onClick={openResetPwd}
            sx={{ my: 1, color: "gray" }}
            underline="hover"
          >
            Forgot my password
          </Link>
          <Stack direction="row" justifyContent="center">
            <Typography display="inline" color="textSecondary" sx={{ mr: 1 }}>
              Need an account?
            </Typography>
            <Link className="link" onClick={openSignup} underline="hover">
              <Typography>SIGN UP</Typography>
            </Link>
          </Stack>
        </Box>
      </Box>
      <SignUpForm open={signupOpen} handleClose={closeSignup} />
      <ResetPwdForm open={resetOpen} handleClose={closeResetPwd} />
    </Box>
  );
}
