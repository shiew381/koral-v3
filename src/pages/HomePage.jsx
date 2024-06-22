import { useState, useEffect } from "react";
import { Alert, Box, Button, Link, Stack, Typography } from "@mui/material";
import { SignUpForm } from "../components/forms/SignUpForm";
import { EmailField, PasswordField } from "../components/common/InputFields";
import { ResetPwdForm } from "../components/forms/ResetPwdForm";
import { useAuth } from "../contexts/AuthContext";
import LockIcon from "@mui/icons-material/Lock";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";
import { authErrorMessage } from "../utils/errorMsgs";
import { SubmitBtn } from "../components/common/Buttons";
import { LoadingIndicator } from "../components/common/Pages";

export default function HomePage() {
  const imgURL = import.meta.env.VITE_HOME_PAGE_IMG;

  const [loading, setLoading] = useState(true);
  const [signupOpen, setSignupOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const { user } = useAuth();

  const navigate = useNavigate();
  const navigateToCourses = () => navigate("/classroom/courses");

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

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <Box height="100vh" className="flex flex-center">
        <LoadingIndicator />
      </Box>
    );
  }

  return (
    <Box height="100vh" className="flex flex-center">
      <Box className="flex flex-center flex-wrap" width="750px">
        <Box sx={{ p: "40px" }}>
          <img src={imgURL} alt="app logo" width="320px" />
        </Box>

        {user ? (
          <ContinueToCoursesPanel
            user={user}
            navigateToCourses={navigateToCourses}
          />
        ) : (
          <LoginPanel
            openResetPwd={openResetPwd}
            openSignup={openSignup}
            navigateToCourses={navigateToCourses}
          />
        )}
      </Box>
      <SignUpForm open={signupOpen} handleClose={closeSignup} />
      <ResetPwdForm open={resetOpen} handleClose={closeResetPwd} />
    </Box>
  );
}

function LoginPanel({ navigateToCourses, openResetPwd, openSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();

  function handleEmail(e) {
    setEmail(e.target.value);
  }

  function handlePassword(e) {
    setPassword(e.target.value);
  }

  function handleLogin() {
    setErrorMessage("");
    setSubmitting(true);
    login(email, password)
      .then(() => navigateToCourses())
      .catch((error) => {
        setTimeout(() => setErrorMessage(authErrorMessage(error.code)), 600);
      })
      .finally(() => setTimeout(() => setSubmitting(false), 500));
  }

  function handleEnter(e) {
    if (e.code === "Enter") {
      handleLogin();
    }
  }

  return (
    <Box width="300px" onKeyUp={handleEnter} sx={{ mx: 3 }}>
      <EmailField onChange={handleEmail} value={email} />
      <PasswordField onChange={handlePassword} value={password} />
      <SubmitBtn
        fullWidth
        disabled={submitting}
        label="LOG IN"
        onClick={handleLogin}
        submitting={submitting}
      />
      {errorMessage && <Alert severity="warning">{errorMessage}</Alert>}
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
  );
}

function ContinueToCoursesPanel({ user, navigateToCourses }) {
  const { logout } = useAuth();

  return (
    <Box width="350px" textAlign="center">
      <Typography display="block" variant="subtitle 1">
        You&apos;re logged in as
      </Typography>
      <Typography variant="h6" color="primary" sx={{ mb: 5 }}>
        {user.email}
      </Typography>
      <Button
        color="secondary"
        fullWidth
        onClick={navigateToCourses}
        variant="contained"
        sx={{ mb: 1 }}
        endIcon={<ArrowForwardIosIcon />}
      >
        CONTINUE TO COURSES
      </Button>
      <Button
        color="secondary"
        fullWidth
        variant="outlined"
        endIcon={<LockIcon />}
        onClick={logout}
      >
        LOG OUT
      </Button>
    </Box>
  );
}
