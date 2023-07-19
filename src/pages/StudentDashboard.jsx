import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchCourse,
  fetchAssignments,
  fetchResources,
  fetchAnnouncements,
  fetchGrades,
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
import CampaignIcon from "@mui/icons-material/Campaign";
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
      {tabIndex === 1 && <Announcements course={course} />}
      {tabIndex === 3 && <Assignments course={course} />}
      {tabIndex == 4 && <Resources course={course} />}
      {tabIndex === 2 && <Grades course={course} user={user} />}
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

function Announcements({ course }) {
  const [loading, setLoading] = useState(true);
  const [anncmts, setAnncmts] = useState([]);

  const listWidth = "600px";

  useEffect(
    () => fetchAnnouncements(course.id, setAnncmts, setLoading),
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

  if (anncmts?.length === 0) {
    return (
      <Panel center>
        <Typography color="text.secondary">
          Your instructor has not made any announcements yet!
        </Typography>
      </Panel>
    );
  }

  if (anncmts?.length > 0) {
    return (
      <Panel>
        <List sx={{ width: listWidth, pt: "50px" }}>
          {anncmts.map((anncmt) => (
            <div key={anncmt.id}>
              <ListItem>
                <ListItemIcon>
                  <CampaignIcon />
                </ListItemIcon>
                <ListItemText
                  primary={anncmt.message}
                  secondary={"posted " + formatTimeAndDate(anncmt.dateCreated)}
                />
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
      </Panel>
    );
  }
}

function Assignments({ course }) {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const listWidth = "600px";

  function redirectToAsgmt(asgmt) {
    const courseTitle = encodeURI(course.title.replace(/\s/g, "-"));
    const asgmtTitle = encodeURI(asgmt.title.replace(/\s/g, "-"));

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
          <div key={asgmt.id}>
            <ListItem
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
                primary={asgmt.title}
                secondary={
                  <>
                    Open: {formatTimeAndDate(asgmt.dateOpen)}
                    <br />
                    Due: {formatTimeAndDate(asgmt.dateDue)}
                  </>
                }
              />
            </ListItem>
            {ind < assignments.length - 1 && <Divider />}
          </div>
        ))}
      </List>
    </Panel>
  );
}

function Resources({ course }) {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
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
        {resources.map((resource, ind) => (
          <div key={resource.id}>
            <ListItem
              secondaryAction={
                <Button endIcon={<NavigateNextIcon />}>VIEW</Button>
              }
            >
              <ListItemIcon>
                <ResourceIcon type={resource.type} />
              </ListItemIcon>
              <ListItemText
                primary={resource.title}
                secondary={"Added: " + formatDate(resource.dateCreated)}
              />
            </ListItem>
            {ind < resources.length - 1 && <Divider />}
          </div>
        ))}
      </List>
    </Panel>
  );
}

function Grades({ course, user }) {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(
    () => {
      if (!user) return;
      console.log(user);
      console.log(course);
      fetchGrades(course.id, user.uid, setGrades);
    },
    //eslint-disable-next-line
    [user]
  );

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

  return (
    <Panel>
      <pre>{JSON.stringify(grades, null, 2)}</pre>
      <Box sx={{ pt: "50px" }}>
        <table style={{ width: "300px", textAlign: "center" }}>
          <thead>
            <tr>
              <th style={{ width: "50%" }}>assignment</th>
              <th style={{ width: "50%" }}>score</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((asgmt) => (
              <tr key={asgmt.id}>
                <td>{asgmt.title}</td>
                <td>
                  {grades[asgmt.id].totalPointsAwarded} of{" "}
                  {grades[asgmt.id].totalPointsPossible}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Panel>
  );
}
