import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCourse, fetchAssignments } from "../utils/firestoreClient";
import { Box, Button, Tab, Tabs, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Page, LoadingIndicator } from "../components/common/Pages";
import {
  CourseImage,
  CourseSummary,
} from "../components/common/CourseDashboard";

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courseID } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  function redirectToCourses() {
    navigate("/classroom/courses");
  }

  function selectTab(e, newIndex) {
    setTabIndex(newIndex);
  }

  useEffect(() => fetchCourse(courseID, setCourse, setLoading), [courseID]);

  if (loading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );
  }
  return (
    <div className="dashboard-container">
      <div style={{ position: "absolute" }}>
        <Button startIcon={<ChevronLeftIcon />} onClick={redirectToCourses}>
          All Courses
        </Button>
      </div>
      <div className="tabs-vertical">
        <Tabs
          onChange={selectTab}
          orientation="vertical"
          sx={{
            borderRight: 1,
            borderColor: "divider",
            minHeight: "50vh",
            pt: "80px",
          }}
          value={tabIndex}
        >
          <Tab label="Course Info" />
          <Tab label="Announcements" />
          <Tab label="Grades" />
          <Tab label="Assignments" />
          <Tab label="Resources" />
        </Tabs>
      </div>
      {tabIndex === 0 && <CourseInfo course={course} />}
      {tabIndex === 3 && <Assignments course={course} />}
    </div>
  );
}

function CourseInfo({ course }) {
  return (
    <Box className="flex flex-grow flex-center">
      <CourseImage />
      <CourseSummary course={course} />
    </Box>
  );
}

function Assignments({ course }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const listWidth = "600px";

  useEffect(
    () => fetchAssignments(course.id, setAssignments, setLoading),
    //eslint-disable-next-line
    []
  );

  if (loading) {
    return (
      <div className="flex flex-col flex-center flex-grow">
        <LoadingIndicator />
      </div>
    );
  }

  if (assignments?.length === 0) {
    return (
      <div className="flex flex-col flex-center flex-grow">
        <div style={{ position: "relative", bottom: "80px" }}>
          <Typography sx={{ mb: 2 }}>
            Your instructor has not added any assignments yet!
          </Typography>
        </div>
      </div>
    );
  }
  return <Box className="flex flex-grow flex-center">Assignments</Box>;
}
