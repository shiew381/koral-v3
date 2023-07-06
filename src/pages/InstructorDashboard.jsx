import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../config/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { Box, Button, Tab } from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import {
  CourseImage,
  CourseSummary,
  CourseTabs,
} from "../components/common/CourseDashboard";
import { useAuth } from "../contexts/AuthContext";
import { Page } from "../components/common/Pages";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { title, courseID } = useParams();

  const [course, setCourse] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  const selectTab = (e, newIndex) => setTabIndex(newIndex);

  const courseTitle = title.replace(/\s/g, "-");
  const navigateToStudentDashboard = () =>
    navigate(`/classroom/courses/${courseTitle}/${courseID}/student/dashboard`);

  useEffect(() => {
    //TODO: restrict access to instructor
    const docRef = doc(db, "courses", courseID);
    const unsubscribe = onSnapshot(docRef, (doc) =>
      setCourse({ id: doc.id, ...doc.data() })
    );
    return unsubscribe;
  }, [courseID]);

  return (
    <Page>
      <Box className="flex flex-row relative" sx={{ pt: 2 }}>
        <Box sx={{ position: "absolute", top: 0, right: 0 }}>
          <Button
            onClick={navigateToStudentDashboard}
            startIcon={<GroupIcon />}
          >
            Student View
          </Button>
        </Box>

        <CourseTabs handleChange={selectTab} value={tabIndex}>
          <Tab label="Course Info" />
          <Tab label="Announcements" />
          <Tab label="Grades" />
          <Tab label="Assignments" />
        </CourseTabs>
        <CourseInfo course={course} tabIndex={tabIndex} />
        <Grades tabIndex={tabIndex} />
        <Announcements tabIndex={tabIndex} />
        <Assignments tabIndex={tabIndex} />
      </Box>
    </Page>
  );
}

function CourseInfo({ course, tabIndex }) {
  if (tabIndex !== 0) return null;
  return (
    <Box className="flex flex-grow flex-center" sx={{ pt: "20vh" }}>
      <CourseImage />
      <CourseSummary course={course} />
    </Box>
  );
}

function Announcements({ tabIndex }) {
  if (tabIndex !== 1) return null;
  return "Announcements";
}

function Grades({ tabIndex }) {
  if (tabIndex !== 2) return null;
  return "Grades";
}

function Assignments({ tabIndex }) {
  if (tabIndex !== 3) return null;
  return "Assignments";
}
