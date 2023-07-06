import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCourse } from "../utils/firestoreClient";
import { Box, Button, Tabs, Tab } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import {
  CourseImage,
  CourseSummary,
  CourseTabs,
} from "../components/common/CourseDashboard";
import { Page, LoadingIndicator } from "../components/common/Pages";
import "../css/CourseDashboard.css";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { title, courseID } = useParams();
  const [loading, setLoading] = useState(true);

  const [course, setCourse] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  const selectTab = (e, newIndex) => setTabIndex(newIndex);

  const courseTitle = title.replace(/\s/g, "-");

  function navigateToStudentDashboard() {
    navigate(`/classroom/courses/${courseTitle}/${courseID}/student/dashboard`);
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
      <div className="tabs-vertical">
        <Tabs onChange={selectTab} orientation="vertical" value={tabIndex}>
          <Tab label="Course Info" />
          <Tab label="Announcements" />
          <Tab label="Grades" />
          <Tab label="Assignments" />
        </Tabs>
      </div>
      <div className="tabs-horizontal">
        <Tabs value={tabIndex} onChange={selectTab}>
          <Tab label="Course Info" />
          <Tab label="Announcements" />
          <Tab label="Grades" />
          <Tab label="Assignments" />
        </Tabs>
      </div>

      <CourseInfo course={course} tabIndex={tabIndex} />
      <Grades tabIndex={tabIndex} />
      <Announcements tabIndex={tabIndex} />
      <Assignments tabIndex={tabIndex} />
      <Resources tabIndex={tabIndex} />
    </div>
  );
}

function CourseInfo({ course, tabIndex }) {
  if (tabIndex === 0) {
    return (
      <Box className="flex flex-grow flex-center" sx={{ pt: "20vh" }}>
        <CourseImage />
        <CourseSummary course={course} />
      </Box>
    );
  } else {
    return null;
  }
}

function Announcements({ tabIndex }) {
  if (tabIndex !== 1) return null;
  return "Announcements";
}

function Grades({ tabIndex }) {
  if (tabIndex === 2) {
    return "Grades";
  } else {
    return null;
  }
}

function Assignments({ tabIndex }) {
  if (tabIndex === 3) {
    return "Assignments";
  } else {
    return null;
  }
}

function Resources({ tabIndex }) {
  if (tabIndex === 4) {
    return "Resources";
  } else {
    return null;
  }
}

function StudentView() {
  return (
    <Box sx={{ position: "absolute", top: 0, right: 0 }}>
      <Button onClick={navigateToStudentDashboard} startIcon={<GroupIcon />}>
        Student View
      </Button>
    </Box>
  );
}
