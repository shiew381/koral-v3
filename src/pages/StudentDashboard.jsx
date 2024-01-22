import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  fetchCourse,
  fetchAssignments,
  fetchResources,
  fetchAnnouncements,
  getUserGrades,
} from "../utils/firestoreClient";
import { formatDate, formatTimeAndDate } from "../utils/dateUtils";
import { truncateString } from "../utils/commonUtils";
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
import { formatGrade } from "../utils/gradeUtils";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(
    () => {
      if (location.state === "resources") {
        setTabIndex(3);
      }

      if (location.state === "assignments") {
        setTabIndex(2);
      }
    },
    //eslint-disable-next-line
    []
  );

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
        <Button
          color="secondary"
          startIcon={<ChevronLeftIcon />}
          onClick={redirectToCourses}
        >
          All Courses
        </Button>
      </div>
      <div className="tabs-vert-container">
        <Tabs
          className="tabs-vert"
          indicatorColor="secondary"
          onChange={selectTab}
          orientation="vertical"
          sx={{
            borderRight: 1,
            borderColor: "divider",
            minHeight: "50vh",
          }}
          textColor="secondary"
          value={tabIndex}
        >
          <Tab label="Course Info" />
          <Tab label="Announcements" />
          <Tab label="Assignments" />
          <Tab label="Resources" />
          <Tab label="Grades" />
        </Tabs>
      </div>
      <div className="tabs-horiz-container">
        <Tabs
          indicatorColor="secondary"
          onChange={selectTab}
          textColor="secondary"
          value={tabIndex}
          variant="scrollable"
        >
          <Tab label="Course Info" />
          <Tab label="Announcements" />
          <Tab label="Assignments" />
          <Tab label="Resources" />
          <Tab label="Grades" />
        </Tabs>
      </div>
      {tabIndex === 0 && <CourseInfo course={course} />}
      {tabIndex === 1 && <Announcements course={course} />}
      {tabIndex === 2 && <Assignments course={course} />}
      {tabIndex == 3 && <Resources course={course} />}
      {tabIndex === 4 && <Grades course={course} user={user} />}
    </div>
  );
}

function CourseInfo({ course }) {
  const courseImage = course.courseImage || null;

  return (
    <Panel center>
      <Box>
        <Box className="flex flex-row flex-center flex-wrap">
          <Box className="relative" sx={{ maxWidth: "400px" }}>
            <CourseImage url={courseImage?.url} />
          </Box>
          <Box className="course-title-and-description">
            <Typography color="primary" sx={{ my: "8px" }} variant="h4">
              {course.title}
            </Typography>
            <Typography>{course.description}</Typography>
          </Box>
        </Box>
        <Box sx={{ px: 3, my: 3 }}>
          <Divider />
        </Box>
      </Box>
      <CourseSummary course={course} />
    </Panel>
  );
}

function Announcements({ course }) {
  const [loading, setLoading] = useState(true);
  const [anncmts, setAnncmts] = useState([]);

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
        <List className="course-item-list" sx={{ pt: "60px" }}>
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

  function redirectToAsgmt(asgmt) {
    const courseTitle = encodeURI(
      course.title.replace(/\s/g, "-").replace(/\?/g, "")
    );
    const asgmtTitle = encodeURI(
      asgmt.title.replace(/\s/g, "-").replace(/\?/g, "")
    );

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
      <List className="course-item-list" sx={{ pt: "60px" }}>
        {assignments.map((asgmt, ind) => (
          <div key={asgmt.id}>
            <ListItem
              secondaryAction={
                <Button
                  color="secondary"
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
                    {!asgmt.hasDateOpen &&
                      !asgmt.hasDateDue &&
                      "always available"}
                    {asgmt.hasDateOpen &&
                      `Open: ${formatTimeAndDate(asgmt.dateOpen)}`}
                    {asgmt.hasDateOpen && <br />}
                    {asgmt.hasDateDue &&
                      `Due: ${formatTimeAndDate(asgmt.dateDue)}`}
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);

  function redirectToResource(resource) {
    const courseTitle = encodeURI(
      course.title.replace(/\s/g, "-").replace(/\?/g, "")
    );
    const resourceTitle = encodeURI(
      resource.title.replace(/\s/g, "-").replace(/\?/g, "")
    );

    const path = `/classroom/courses/${courseTitle}/${course.id}/resource/${resourceTitle}/${resource.id}`;

    navigate(path, { replace: true });
  }

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
      <List className="course-item-list" sx={{ pt: "60px" }}>
        {resources.map((resource, ind) => (
          <div key={resource.id}>
            <ListItem
              secondaryAction={
                <Button
                  color="secondary"
                  endIcon={<NavigateNextIcon />}
                  onClick={() => redirectToResource(resource)}
                >
                  VIEW
                </Button>
              }
            >
              <ListItemIcon>
                <ResourceIcon type={resource.type} />
              </ListItemIcon>
              <ListItemText
                primary={truncateString(resource.title, 40)}
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
  const cellStyle = { padding: "10px", textAlign: "center", width: "300px" };

  const cellStyle2 = {
    padding: "10px",
    textAlign: "center",
    width: "150px",
  };

  function compareTitles(a, b) {
    if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
    if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
    return 0;
  }

  const sorted = assignments.sort(compareTitles);

  useEffect(
    () => {
      if (!user) return;
      getUserGrades(course.id, user.uid, setGrades);
    },
    //eslint-disable-next-line
    [user]
  );

  useEffect(
    () => fetchAssignments(course.id, setAssignments, setLoading, "gradebook"),
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
      <Box sx={{ pt: "50px" }}>
        <table style={{ textAlign: "center" }}>
          <thead>
            <tr style={{ backgroundColor: "rgba(95,161,181,0.3)" }}>
              <th style={cellStyle}>Assignment</th>
              <th style={cellStyle2}>Score</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((asgmt, ind) => (
              <tr
                key={asgmt.id}
                style={{
                  backgroundColor:
                    ind % 2 === 0 ? "rgba(95,161,181,0.1)" : "white",
                }}
              >
                <td style={cellStyle}>{asgmt.title}</td>
                <td style={cellStyle2}>{formatGrade(asgmt, grades)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        <br />
      </Box>
    </Panel>
  );
}
