import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { Alert, List, ListItem, ListItemText, Stack } from "@mui/material";
import {
  ConfirmPasswordField,
  EmailField,
  FirstNameField,
  LastNameField,
  PasswordField,
} from "../common/InputFields";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { authErrorMessage } from "../../utils/errorMsgs.js";

export function SignUpForm({ open, handleClose }) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [cfmPassword, setCfmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { signup } = useAuth();

  const match = password && password === cfmPassword;
  const length = password.length || 0;
  const numCapitalLetters = password.match(/[A-Z]/g)?.length || 0;
  const numSpecialChar = password.match(/[~!@#$%&_+-]/g)?.length || 0;
  const allFulfilled =
    email &&
    firstName &&
    lastName &&
    length &&
    numCapitalLetters &&
    numSpecialChar &&
    match;

  function handleEmail(e) {
    setEmail(e.target.value);
  }

  function handleFirstName(e) {
    setFirstName(e.target.value);
  }

  function handleLastName(e) {
    setLastName(e.target.value);
  }

  function handlePassword(e) {
    setPassword(e.target.value);
  }

  function handleCfmPassword(e) {
    setCfmPassword(e.target.value);
  }

  function handleKeyUp(e) {
    if (!allFulfilled) return;
    if (e.code === "Enter") {
      createUserAccount();
    }
  }

  function resetForm() {
    setEmail("");
    setFirstName("");
    setLastName("");
    setPassword("");
    setCfmPassword("");
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function createUserAccount() {
    setErrorMessage("");
    setSubmitting(true);
    signup(email, password)
      .then((userCredentials) => {
        console.log(userCredentials);
        setDoc(doc(db, "users", userCredentials.user.uid), {
          userID: userCredentials.user.uid,
          email: email,
          firstName: firstName,
          lastName: lastName,
          permissions: [],
          emailVerified: false,
        });
      })
      .then(() => {
        setTimeout(() => setSubmitting(false), 500);
        setTimeout(() => setSuccessMessage("Success! Account created."), 600);
        setTimeout(() => handleClose(), 2000);
      })
      .catch((error) => {
        console.log(error);
        setTimeout(() => setSubmitting(false), 500);
        setTimeout(() => setErrorMessage(authErrorMessage(error.code)), 600);
      });
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox open={open} onClose={handleClose} handleKeyUp={handleKeyUp}>
      <LightboxHeader title="Create A New Account" center />
      <EmailField onChange={handleEmail} value={email} />
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <FirstNameField onChange={handleFirstName} value={firstName} />
        <LastNameField onChange={handleLastName} value={lastName} />
      </Stack>
      <PasswordField onChange={handlePassword} value={password} />
      <ConfirmPasswordField onChange={handleCfmPassword} value={cfmPassword} />

      <List>
        <ListItem>
          <ListItemText primary="Password must:" />
        </ListItem>
        <PasswordValidation
          clean={length === 0}
          condition={length >= 10}
          primaryText="have at least 10 characters"
        />
        <PasswordValidation
          clean={length === 0}
          condition={numCapitalLetters > 0}
          primaryText="have at least one capital letter"
        />
        <PasswordValidation
          clean={length === 0}
          condition={numSpecialChar > 0}
          primaryText="have at least one special character"
          secondaryText="choose from: ~ ! @ # $ % & _ + -"
        />
        <PasswordValidation
          clean={length === 0}
          condition={match}
          primaryText="match the confirm password field"
        />
      </List>

      {errorMessage && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <BtnContainer right>
        <SubmitBtn
          disabled={!allFulfilled || submitting}
          label="CREATE MY ACCOUNT"
          onClick={createUserAccount}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}

function PasswordValidation({ clean, condition, primaryText, secondaryText }) {
  function getColor() {
    if (clean) return { color: "inherit" };
    if (condition) return { color: "text.success" };
    if (!condition) return { color: "text.error" };
  }

  return (
    <ListItem sx={{ py: 0, pl: 4 }}>
      <ListItemText
        primary={primaryText}
        secondary={secondaryText}
        sx={getColor()}
      />
    </ListItem>
  );
}
