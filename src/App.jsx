import { useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme.js";
import { NavBar } from "./components/navigation/NavBar.jsx";
import { NavMenu } from "./components/navigation/NavMenu";
import HomePage from "./pages/HomePage.jsx";
import InstructorDashboard from "./pages/InstructorDashboard.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import DocumentsPage from "./pages/DocumentsPage.jsx";
import ImagesPage from "./pages/ImagesPage.jsx";
import LinksPage from "./pages/LinksPage.jsx";
import QuestionSetsPage from "./pages/QuestionSetsPage.jsx";
import QuestionSetPage from "./pages/QuestionSetPage.jsx";
import "./css/App.css";

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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div onClick={handleClose}>
              <NavBar handleOpen={handleOpen} />
              <NavMenu open={open} />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="classroom/courses/:title/:courseID/instructor/dashboard"
                  element={<InstructorDashboard />}
                />
                <Route path="classroom/courses" element={<CoursesPage />} />
                <Route path="content/documents" element={<DocumentsPage />} />
                <Route path="content/images" element={<ImagesPage />} />
                <Route path="content/links" element={<LinksPage />} />
                <Route
                  path="content/question-sets/:title/:qSetID"
                  element={<QuestionSetPage />}
                />
                <Route
                  path="content/question-sets"
                  element={<QuestionSetsPage />}
                />
              </Routes>
            </div>
          </LocalizationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
