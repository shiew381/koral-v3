import { Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

export function BackToStudentDashboard({ location }) {
  const navigate = useNavigate();
  const { courseID, title } = useParams();

  function redirectToStudentDashboard() {
    navigate(`/classroom/courses/${title}/${courseID}/student/dashboard`, {
      state: location,
    });
  }

  return (
    <div className="page-actions">
      <Button
        color="primary"
        startIcon={<ChevronLeftIcon />}
        onClick={redirectToStudentDashboard}
      >
        COURSE DASHBOARD
      </Button>
    </div>
  );
}
