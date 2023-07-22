import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStorage } from "../hooks/useStorage";
import { useNavigate, useParams } from "react-router-dom";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../config/firebaseConfig.js";
import {
  addPointerToCourseImage,
  deleteCourseAnncmt,
  deleteCourseAsgmt,
  deleteCourseImage,
  deleteCourseResource,
  fetchAnnouncements,
  fetchAssignments,
  fetchCourse,
  fetchGrades,
  fetchResources,
} from "../utils/firestoreClient";
import { formatDate, formatTimeAndDate } from "../utils/dateUtils";
import {
  Alert,
  Box,
  Button,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CampaignIcon from "@mui/icons-material/Campaign";
import AddIcon from "@mui/icons-material/Add";
import {
  AssignmentIcon,
  CourseImage,
  CourseSummary,
  Panel,
  ResourceIcon,
} from "../components/common/DashboardCpnts";
import { Page, LoadingIndicator } from "../components/common/Pages";
import { getFileExtension } from "../utils/fileUtils";
import "../css/CourseDashboard.css";
import { MoreOptionsBtn } from "../components/common/Buttons";
import { MenuOption, MoreOptionsMenu } from "../components/common/Menus";
import { AssignmentForm } from "../components/forms/AssignmentForm";
import { ResourceForm } from "../components/forms/ResourceForm";
import { AnnouncementForm } from "../components/forms/AnnouncementForm";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courseID } = useParams();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [asgmtOpen, setAsgmtOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [anncmtOpen, setAnncmtOpen] = useState(false);
  const [selAnncmt, setSelAnncmt] = useState(null);
  const [selAsgmt, setSelAsgmt] = useState(null);
  const [edit, setEdit] = useState(false);

  function redirectToCourses() {
    navigate("/classroom/courses");
  }

  function selectTab(e, newIndex) {
    setTabIndex(newIndex);
  }

  function handleAnncmtOpen() {
    setAnncmtOpen(true);
  }

  function handleAnncmtClose() {
    setAnncmtOpen(false);
    setEdit(false);
  }

  function handleAsgmtOpen() {
    setAsgmtOpen(true);
  }

  function handleAsgmtClose() {
    setAsgmtOpen(false);
    setEdit(false);
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
      <div className="tabs-vert-container">
        <Tabs
          className="tabs-vert"
          onChange={selectTab}
          orientation="vertical"
          sx={{
            borderRight: 1,
            borderColor: "divider",
            minHeight: "50vh",
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
      <div className="tabs-horiz-container">
        <Tabs value={tabIndex} onChange={selectTab} variant="scrollable">
          <Tab label="Course Info" />
          <Tab label="Announcements" />
          <Tab label="Assignments" />
          <Tab label="Resources" />
          <Tab label="Grades" />
        </Tabs>
      </div>

      {tabIndex === 0 && <CourseInfo course={course} />}
      {tabIndex === 1 && (
        <Announcements
          course={course}
          handleOpen={handleAnncmtOpen}
          selAnncmt={selAnncmt}
          setSelAnncmt={setSelAnncmt}
          setEdit={setEdit}
        />
      )}
      {tabIndex === 2 && (
        <Assignments
          course={course}
          handleOpen={handleAsgmtOpen}
          selAsgmt={selAsgmt}
          setSelAsgmt={setSelAsgmt}
          setEdit={setEdit}
        />
      )}
      {tabIndex == 3 && (
        <Resources course={course} handleOpen={handleResourceOpen} />
      )}
      {tabIndex === 4 && <Grades course={course} />}
      <ResourceForm
        course={course}
        handleClose={handleResourceClose}
        open={resourceOpen}
        user={user}
      />
      <AssignmentForm
        course={course}
        edit={edit}
        handleClose={handleAsgmtClose}
        open={asgmtOpen}
        selAsgmt={selAsgmt}
        setSelAsgmt={setSelAsgmt}
        user={user}
      />
      <AnnouncementForm
        course={course}
        edit={edit}
        handleClose={handleAnncmtClose}
        open={anncmtOpen}
        selAnncmt={selAnncmt}
        setSelAnncmt={setSelAnncmt}
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
      <Box>
        <Box className="flex flex-row flex-center flex-wrap">
          <Box className="relative" sx={{ width: "400px" }}>
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
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
            {error && <Alert severity="warning">{errorMessage}</Alert>}
          </Box>

          <Box className="course-title-and-description">
            <Typography color="primary" sx={{ my: "8px" }} variant="h4">
              {course.title}
            </Typography>
            <Typography sx={{ mb: "30px" }}>{course.description}</Typography>
          </Box>
        </Box>
        <Box sx={{ px: 3, my: 3 }}>
          <Divider />
        </Box>
      </Box>
      <CourseSummary course={course} instructor />
    </Panel>
  );
}

function Announcements({
  course,
  handleOpen,
  selAnncmt,
  setSelAnncmt,
  setEdit,
}) {
  const [loading, setLoading] = useState(true);
  const [anncmts, setAnncmts] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  function handleCloseMenu() {
    setAnchorEl(null);
  }

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
        <div style={{ position: "relative", bottom: "80px" }}>
          <Typography sx={{ mb: 2 }}>
            Get started by add your first assignment!
          </Typography>
          <div className="flex flex-center">
            <Button onClick={handleOpen} startIcon={<AddIcon />} size="large">
              ADD ANNOUNCEMENT
            </Button>
          </div>
        </div>
      </Panel>
    );
  }

  if (anncmts?.length > 0) {
    return (
      <Panel>
        <Box className="course-list-actions-container">
          <Button onClick={handleOpen} startIcon={<AddIcon />}>
            NEW ANNOUNCEMENT
          </Button>
        </Box>
        <Box className="course-divider-container">
          <Divider sx={{ px: 3 }} />
        </Box>

        <List className="course-item-list">
          {anncmts.map((anncmt) => (
            <div key={anncmt.id}>
              <ListItem
                secondaryAction={
                  <MoreOptionsBtn
                    item={anncmt}
                    setAnchorEl={setAnchorEl}
                    setSelItem={setSelAnncmt}
                  />
                }
              >
                <ListItemIcon>
                  <CampaignIcon />
                </ListItemIcon>
                <ListItemText
                  primary={anncmt.message}
                  secondary={formatTimeAndDate(anncmt.dateCreated)}
                />
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
        <MoreOptionsMenu
          anchorEl={anchorEl}
          handleClose={handleCloseMenu}
          open={menuOpen}
        >
          <MenuOption>
            <ListItemButton
              onClick={() => {
                handleOpen();
                handleCloseMenu();
                setEdit(true);
              }}
            >
              Edit
            </ListItemButton>
          </MenuOption>
          <MenuOption>
            <ListItemButton
              onClick={() => {
                deleteCourseAnncmt(course, selAnncmt);
                handleCloseMenu();
              }}
            >
              Delete
            </ListItemButton>
          </MenuOption>
        </MoreOptionsMenu>
      </Panel>
    );
  }
}

function Assignments({ course, handleOpen, selAsgmt, setEdit, setSelAsgmt }) {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  function handleCloseMenu() {
    setAnchorEl(null);
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

  if (assignments?.length > 0) {
    return (
      <Panel>
        <Box className="course-list-actions-container">
          <Button onClick={handleOpen} startIcon={<AddIcon />}>
            ADD ASSIGNMENT
          </Button>
        </Box>
        <Box className="course-divider-container">
          <Divider sx={{ px: 3 }} />
        </Box>
        <List className="course-item-list">
          {assignments.map((asgmt) => (
            <div key={asgmt.id}>
              <ListItem
                secondaryAction={
                  <MoreOptionsBtn
                    item={asgmt}
                    setAnchorEl={setAnchorEl}
                    setSelItem={setSelAsgmt}
                  />
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
              <Divider />
            </div>
          ))}
        </List>
        <MoreOptionsMenu
          anchorEl={anchorEl}
          handleClose={handleCloseMenu}
          open={menuOpen}
        >
          <MenuOption>
            <ListItemButton
              onClick={() => {
                handleOpen();
                handleCloseMenu();
                setEdit(true);
              }}
            >
              Edit
            </ListItemButton>
          </MenuOption>
          <MenuOption>
            <ListItemButton
              onClick={() => {
                deleteCourseAsgmt(course, selAsgmt);
                handleCloseMenu();
              }}
            >
              Delete
            </ListItemButton>
          </MenuOption>
        </MoreOptionsMenu>
      </Panel>
    );
  }
}

function Resources({ course, handleOpen }) {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [selResource, setSelResource] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  function handleCloseMenu() {
    setAnchorEl(null);
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
      </Panel>
    );
  }

  if (resources?.length > 0) {
    return (
      <Panel>
        <Box className="course-list-actions-container">
          <Button onClick={handleOpen} startIcon={<AddIcon />}>
            Add Resource
          </Button>
        </Box>
        <Box className="course-divider-container">
          <Divider sx={{ px: 3 }} />
        </Box>
        <List className="course-item-list">
          {resources.map((resource) => (
            <div key={resource.id}>
              <ListItem
                secondaryAction={
                  <MoreOptionsBtn
                    item={resource}
                    setAnchorEl={setAnchorEl}
                    setSelItem={setSelResource}
                  />
                }
              >
                <ListItemIcon>
                  <ResourceIcon type={resource.type} />
                </ListItemIcon>
                <ListItemText
                  primary={resource.title}
                  secondary={"added: " + formatDate(resource.dateCreated)}
                />
              </ListItem>
              <Divider />
            </div>
          ))}
        </List>
        <MoreOptionsMenu
          anchorEl={anchorEl}
          handleClose={handleCloseMenu}
          open={menuOpen}
        >
          <MenuOption>
            <ListItemButton
              onClick={() => {
                deleteCourseResource(course, selResource);
                handleCloseMenu();
              }}
            >
              Delete
            </ListItemButton>
          </MenuOption>
        </MoreOptionsMenu>
      </Panel>
    );
  }
}

function Grades({ course }) {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const cellStyle = { padding: "10px", textAlign: "left" };
  const cellStyle2 = { padding: "10px", textAlign: "center" };

  useEffect(
    () => {
      fetchGrades(course.id, setGrades);
    },
    //eslint-disable-next-line
    []
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

  if (grades?.length === 0) {
    return (
      <Panel center>
        <Typography color="text.secondary">
          No assignment submissions yet.
        </Typography>
      </Panel>
    );
  }

  return (
    <Panel>
      <Box sx={{ pt: "50px" }}>
        <table style={{ width: "300px" }}>
          <thead>
            <tr style={{ backgroundColor: "rgba(95,161,181,0.3)" }}>
              <th style={cellStyle}>Student</th>
              {assignments?.map((asgmt) => (
                <th key={asgmt.id} style={cellStyle2}>
                  {asgmt.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grades.map((el, ind) => (
              <tr
                key={el.id}
                style={{
                  backgroundColor:
                    ind % 2 === 0 ? "rgba(95,161,181,0.1)" : "white",
                }}
              >
                <td style={cellStyle}>{el.firstName + " " + el.lastName}</td>
                {assignments?.map((asgmt) => (
                  <td key={asgmt.id} style={cellStyle2}>
                    {el[asgmt.id]?.totalPointsAwarded ||
                      0 + " of " + el[asgmt.id]?.totalPointsPossible}
                  </td>
                ))}
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
