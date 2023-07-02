import { Routes, Route, BrowserRouter } from "react-router-dom";
import { useState } from "react";

import HomePage from "./pages/HomePage.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import { NavBar } from "./components/navigation/NavBar.jsx";
import { NavMenu } from "./components/navigation/NavMenu";
import "./css/App.css";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme.js";

export default function App() {
  const [open, setOpen] = useState(false);

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    if (open) {
      setOpen(false);
    }
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <div onClick={handleClose}>
            <NavBar handleOpen={handleOpen} />
            <NavMenu open={open} />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="documents" element={<CoursesPage />} />
            </Routes>
          </div>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
