import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchCourse,
  fetchAssignments,
  fetchResources,
} from "../utils/firestoreClient";
import { formatDate, formatTimeAndDate } from "../utils/dateUtils";
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Page, LoadingIndicator } from "../components/common/Pages";
import {
  AssignmentIcon,
  CourseImage,
  CourseSummary,
  Panel,
  ResourceIcon,
} from "../components/common/DashboardCpnts";

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

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );
  }
  return (
    <div className="dashboard-container relative">
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
      <div className="tabs-horizontal">
        <Tabs value={tabIndex} onChange={selectTab}>
          <Tab label="Course Info" />
          <Tab label="Announcements" />
          <Tab label="Grades" />
          <Tab label="Assignments" />
          <Tab label="Resources" />
        </Tabs>
      </div>
      {tabIndex === 0 && <CourseInfo course={course} />}
      {tabIndex === 1 && <Announcements />}
      {tabIndex === 3 && <Assignments course={course} />}
      {tabIndex == 4 && <Resources course={course} />}
      {tabIndex === 2 && <Grades />}
    </div>
  );
}

function CourseInfo({ course }) {
  const courseImage = course.courseImage || null;

  return (
    <Panel center>
      <Box sx={{ maxWidth: "640px" }}>
        <Box className="flex flex-row flex-wrap">
          <Box className="flex flex-justify-center flex-grow relative">
            <Box className="relative" sx={{ mb: 2, width: "300px" }}>
              <CourseImage url={courseImage?.url} />
            </Box>
          </Box>
          <Box className="course-title-and-description">
            <Typography color="primary" sx={{ mb: "10px" }} variant="h4">
              {course.title}
            </Typography>
            <Typography>{course.description}</Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
      </Box>
      <CourseSummary course={course} />
    </Panel>
  );
}

function Announcements() {
  return <Panel center>Announcements</Panel>;
}

function Assignments({ course }) {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const listWidth = "600px";

  function redirectToAsgmt(asgmt) {
    const courseTitle = encodeURI(course.title.replace(/\s/g, "-"));
    const asgmtTitle = encodeURI(asgmt.title.replace(/\s/g, "-"));
    console.log(courseTitle);
    console.log(asgmtTitle);
    const path = `/classroom/courses/${courseTitle}/${course.id}/assignment/${asgmtTitle}/${asgmt.id}`;

    navigate(path, { replace: true });
  }

  useEffect(
    () => fetchAssignments(course.id, setAssignments, setLoading),
    //eslint-disable-next-line
    []
  );

  if (loading) {
    return (
      <Panel center>
        <LoadingIndicator />
      </Panel>
    );
  }

  if (assignments?.length === 0) {
    return (
      <Panel center>
        <Typography>
          Your instructor has not added any assignments yet!
        </Typography>
      </Panel>
    );
  }

  return (
    <Panel>
      <List sx={{ width: listWidth, pt: "50px" }}>
        {assignments.map((asgmt, ind) => (
          <>
            <ListItem
              key={asgmt.id}
              secondaryAction={
                <Button
                  endIcon={<NavigateNextIcon />}
                  onClick={() => redirectToAsgmt(asgmt)}
                >
                  VIEW
                </Button>
              }
            >
              <ListItemIcon>
                <AssignmentIcon type={asgmt.type} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography noWrap sx={{ maxWidth: "400px" }} variant="h6">
                    {asgmt.title}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography>
                      Open: {formatTimeAndDate(asgmt.dateOpen)}
                    </Typography>
                    <Typography>
                      Due: {formatTimeAndDate(asgmt.dateDue)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {ind < assignments.length - 1 && <Divider />}
          </>
        ))}
      </List>
    </Panel>
  );
}

function Resources({ course }) {
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
      <Panel center>
        <LoadingIndicator />
      </Panel>
    );
  }

  if (resources?.length === 0) {
    return (
      <Panel center>
        <Typography sx={{ mb: 2 }}>
          Your instructor has not added any resources yet!
        </Typography>
      </Panel>
    );
  }

  return (
    <Panel>
      <List sx={{ width: listWidth, pt: "50px" }}>
        {resources.map((el, ind) => (
          <>
            <ListItem
              key={el.id}
              secondaryAction={
                <Button endIcon={<NavigateNextIcon />}>VIEW</Button>
              }
            >
              <ListItemIcon>
                <ResourceIcon type={el.type} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography noWrap sx={{ maxWidth: "400px" }} variant="h6">
                    {el.title}
                  </Typography>
                }
                secondary={
                  <Typography>Added: {formatDate(el.dateCreated)}</Typography>
                }
              />
            </ListItem>
            {ind < resources.length - 1 && <Divider />}
          </>
        ))}
      </List>
    </Panel>
  );
}

function Grades() {
  return <Panel center>Grades</Panel>;
}
