import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStorage } from "../hooks/useStorage";
import { useNavigate, useParams } from "react-router-dom";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../config/firebaseConfig.js";
import {
  addPointerToCourseImage,
  deleteCourseImage,
  fetchAssignments,
  fetchCourse,
  fetchResources,
} from "../utils/firestoreClient";
import { formatDate, formatTime } from "../utils/dateUtils";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ImageIcon from "@mui/icons-material/Image";
import ArticleIcon from "@mui/icons-material/Article";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import {
  CourseImage,
  CourseSummary,
  Panel,
} from "../components/common/CourseDashboard";
import { Page, LoadingIndicator } from "../components/common/Pages";
import { AssignmentForm } from "../components/forms/AssignmentForm";
import { ResourceForm } from "../components/forms/ResourceForm";
import { getFileExtension } from "../utils/fileUtils";
import "../css/CourseDashboard.css";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courseID } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [asgmtOpen, setAsgmtOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);

  function redirectToCourses() {
    navigate("/classroom/courses");
  }

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
          <Tab label="Assignments" />
          <Tab label="Resources" />
          <Tab label="Grades" />
        </Tabs>
      </div>
      <div className="tabs-horizontal">
        <Tabs value={tabIndex} onChange={selectTab}>
          <Tab label="Course Info" />
          <Tab label="Announcements" />
          <Tab label="Assignments" />
          <Tab label="Resources" />
          <Tab label="Grades" />
        </Tabs>
      </div>

      {tabIndex === 0 && <CourseInfo course={course} />}
      {tabIndex === 1 && <Announcements />}
      {tabIndex === 2 && (
        <Assignments course={course} handleOpen={handleAsgmtOpen} />
      )}
      {tabIndex == 3 && (
        <Resources course={course} handleOpen={handleResourceOpen} />
      )}
      {tabIndex === 4 && <Grades />}
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
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const filePath = `courses/${course.id}/course_image/${file?.name}`;
  const courseImage = course.courseImage || null;

  function handleDeleteCourseImage() {
    const storageRef = ref(storage, courseImage.url);
    deleteObject(storageRef)
      .then(() => deleteCourseImage(course))
      .catch((error) => console.log(error));
  }

  function handleUploadSuccess(url) {
    addPointerToCourseImage(course, file, url);
  }

  function handleSelectFile(e) {
    let selectedFile = e.target.files[0];
    const fileType = selectedFile?.type;
    const fileExtension = getFileExtension(selectedFile);
    const acceptedTypes = ["image/png", "image/jpeg"];
    const acceptedExtensions = ["PNG", "jpeg"];

    const validFile =
      selectedFile &&
      (acceptedTypes.includes(fileType) ||
        acceptedExtensions.includes(fileExtension));

    if (!validFile) {
      setError(true);
      setErrorMessage("please select an image file (PNG or JPG)");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(false);
    setErrorMessage("");
  }

  useStorage(file, setFile, filePath, setUploadProgress, handleUploadSuccess);

  return (
    <Panel center>
      <Box sx={{ maxWidth: "640px" }}>
        <Box className="flex flex-row flex-wrap">
          <Box className="flex flex-justify-center flex-grow relative">
            <Box className="relative" sx={{ mb: 2, width: "300px" }}>
              <CourseImage url={courseImage?.url} />
              {!file && !courseImage && (
                <Button
                  fullWidth
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  UPLOAD CUSTOM IMAGE
                  <input type="file" hidden onChange={handleSelectFile} />
                </Button>
              )}
              {!file && courseImage && (
                <Box className="flex flex-row flex-center">
                  <Typography color="text.secondary" display="inline">
                    {courseImage?.name}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    display="inline"
                    sx={{ ml: "8px" }}
                  >
                    |
                  </Typography>
                  <Button onClick={handleDeleteCourseImage}>DELETE</Button>
                </Box>
              )}
              {file && (
                <Box className="course-img-upload-progress">
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                  />
                </Box>
              )}
              {error && <Alert severity="warning">{errorMessage}</Alert>}
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
      <CourseSummary course={course} instructor />
    </Panel>
  );
}

function Announcements() {
  return <Panel center>Announcements</Panel>;
}

function Grades() {
  return <Panel center>Grades</Panel>;
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
      <Panel center>
        <LoadingIndicator />
      </Panel>
    );
  }

  if (assignments?.length === 0) {
    return (
      <Panel>
        <div style={{ position: "relative", bottom: "80px" }}>
          <Typography sx={{ mb: 2 }}>
            Get started by add your first assignment!
          </Typography>
          <div className="flex flex-center">
            <Button onClick={handleOpen} startIcon={<AddIcon />} size="large">
              ADD ASSIGNMENT
            </Button>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <Box sx={{ width: listWidth, pt: "50px" }}>
        <Button onClick={handleOpen} startIcon={<AddIcon />}>
          ADD ASSIGNMENT
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
                    <Typography>Due: {timeAndDate(asgmt.dateDue)}</Typography>
                  </>
                }
              />
            </ListItem>
          </>
        ))}
      </List>
    </Panel>
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
      <Panel center>
        <LoadingIndicator />
      </Panel>
    );
  }

  if (resources?.length === 0) {
    return (
      <div className="flex flex-col flex-center flex-grow">
        <div style={{ position: "relative", bottom: "80px" }}>
          <Typography sx={{ mb: 2 }}>
            Get started by adding your first resource!
          </Typography>
          <div className="flex flex-center">
            <Button onClick={handleOpen} startIcon={<AddIcon />} size="large">
              ADD RESOURCE
            </Button>
          </div>
        </div>
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

function timeAndDate(dateObj) {
  return formatDate(dateObj) + " " + formatTime(dateObj);
}
