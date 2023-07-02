export function authErrorMessage(errorCode) {
  switch (errorCode) {
    case "auth/invalid-email":
      return "Please check if you entered your email correctly.";
    case "auth/user-not-found":
      return "The email you entered could not be found.";
    case "auth/wrong-password":
      return "The password you entered is incorrect.";
    case "auth/too-many-requests":
      return "You've enterred the incorrect password too many times. Please wait 10 minutes before trying again.";
    case "auth/email-already-in-use":
      return "The email you entered is already in use.";
    default:
      return "An unknown error occured";
  }
}
