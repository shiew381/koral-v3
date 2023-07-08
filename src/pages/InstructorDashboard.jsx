import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchAssignments,
  fetchCourse,
  fetchResources,
} from "../utils/firestoreClient";
import {
  Box,
  Button,
  Tabs,
  Tab,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import {
  CourseImage,
  CourseSummary,
} from "../components/common/CourseDashboard";
import { Page, LoadingIndicator } from "../components/common/Pages";
import { AssignmentForm } from "../components/forms/AssignmentForm";
import AddIcon from "@mui/icons-material/Add";
import "../css/CourseDashboard.css";
import { formatDate, formatTime } from "../utils/dateUtils";
import { ResourceForm } from "../components/forms/ResourceForm";
import ImageIcon from "@mui/icons-material/Image";
import ArticleIcon from "@mui/icons-material/Article";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { courseID } = useParams();
  const [loading, setLoading] = useState(true);

  const [course, setCourse] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [asgmtOpen, setAsgmtOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);

  function selectTab(e, newIndex) {
    setTabIndex(newIndex);
  }

  function handleAsgmtOpen() {
    setAsgmtOpen(true);
  }

  function handleAsgmtClose() {
    setAsgmtOpen(false);
  }

  function handleResourceOpen() {
    setResourceOpen(true);
  }

  function handleResourceClose() {
    setResourceOpen(false);
  }

  useEffect(() => fetchCourse(courseID, setCourse, setLoading), [courseID]);

  // useEffect()

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
        <Tabs
          onChange={selectTab}
          orientation="vertical"
          sx={{ borderRight: 1, borderColor: "divider" }}
          value={tabIndex}
        >
          <Tab label="Course Info" />
          <Tab label="Announcements" />
          <Tab label="Grades" />
          <Tab label="Assignments" />
          <Tab label="Resources" />
        </Tabs>
      </div>
      <div className="tabs-horizontal">
        <Tabs value={tabIndex} onChange={selectTab}>
          <Tab label="Course Info" />
          <Tab label="Announcements" />
          <Tab label="Grades" />
          <Tab label="Assignments" />
          <Tab label="Resources" />
        </Tabs>
      </div>
      <StudentView course={course} />

      {tabIndex === 0 && <CourseInfo course={course} />}
      {tabIndex === 1 && <Announcements />}
      {tabIndex === 2 && <Grades />}
      {tabIndex === 3 && (
        <Assignments course={course} handleOpen={handleAsgmtOpen} />
      )}
      {tabIndex == 4 && (
        <Resources course={course} handleOpen={handleResourceOpen} />
      )}
      <ResourceForm
        course={course}
        handleClose={handleResourceClose}
        open={resourceOpen}
        user={user}
      />
      <AssignmentForm
        course={course}
        handleClose={handleAsgmtClose}
        open={asgmtOpen}
        user={user}
      />
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

function Announcements() {
  return "Announcements";
}

function Grades() {
  return "Grades";
}

function Assignments({ course, handleOpen }) {
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

  return (
    <div
      className="flex flex-col flex-align-center flex-grow"
      style={{ padding: "10px" }}
    >
      <Box sx={{ width: listWidth }}>
        <Button onClick={handleOpen} startIcon={<AddIcon />}>
          Add Assignment
        </Button>
      </Box>

      <List sx={{ width: listWidth }}>
        {assignments.map((asgmt) => (
          <>
            <Divider />
            <ListItem
              key={asgmt.id}
              secondaryAction={
                <IconButton edge="end">
                  <MoreVertIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <AssignmentIcon type={asgmt.type} />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="h6">{asgmt.title}</Typography>}
                secondary={
                  <>
                    <Typography>Open: {timeAndDate(asgmt.dateOpen)}</Typography>
                    <Typography>Due: {timeAndDate(asgmt.dateOpen)}</Typography>
                  </>
                }
              />
            </ListItem>
          </>
        ))}
      </List>
    </div>
  );
}

function Resources({ course, handleOpen }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const listWidth = "600px";

  useEffect(
    () => fetchResources(course.id, setResources, setLoading),
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

  return (
    <div
      className="flex flex-col flex-align-center flex-grow"
      style={{ padding: "10px" }}
    >
      <Box sx={{ width: listWidth }}>
        <Button onClick={handleOpen} startIcon={<AddIcon />}>
          Add Resource
        </Button>
      </Box>
      <List sx={{ width: listWidth }}>
        {resources.map((el) => (
          <>
            <Divider />
            <ListItem
              key={el.id}
              secondaryAction={
                <IconButton edge="end">
                  <MoreVertIcon />
                </IconButton>
              }
            >
              <ListItemIcon>
                <ResourceIcon type={el.type} />
              </ListItemIcon>
              <ListItemText
                primary={<Typography variant="h6">{el.title}</Typography>}
                secondary={
                  <Typography>Added: {formatDate(el.dateCreated)}</Typography>
                }
              />
            </ListItem>
          </>
        ))}
      </List>
    </div>
  );
}

function AssignmentIcon({ type }) {
  switch (type) {
    case "question set": {
      return <AppRegistrationIcon />;
    }
    default:
      return null;
  }
}

function ResourceIcon({ type }) {
  switch (type) {
    case "document": {
      return <ArticleIcon />;
    }
    case "image": {
      return <ImageIcon />;
    }

    default:
      return null;
  }
}

function StudentView({ course }) {
  const { title, courseID } = course;
  const navigate = useNavigate();
  function navigateToStudentDashboard() {
    navigate(`/classroom/courses/${title}/${courseID}/student/dashboard`);
  }
  return (
    <Box sx={{ position: "absolute", top: 0, right: 0 }}>
      <Button onClick={navigateToStudentDashboard} startIcon={<GroupIcon />}>
        Student View
      </Button>
    </Box>
  );
}

function timeAndDate(dateObj) {
  return formatDate(dateObj) + " " + formatTime(dateObj);
}
