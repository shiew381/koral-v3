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
  fetchStudents,
} from "../utils/firestoreClient";
import { formatDate, formatTimeAndDate } from "../utils/dateUtils";
import { formatGrade } from "../utils/gradeUtils";
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
  Link,
  Tooltip,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CampaignIcon from "@mui/icons-material/Campaign";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
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
import { BtnContainer, MoreOptionsBtn } from "../components/common/Buttons";
import { MenuOption, MoreOptionsMenu } from "../components/common/Menus";
import { AssignmentForm } from "../components/forms/AssignmentForm";
import { ResourceForm } from "../components/forms/ResourceForm";
import { AnnouncementForm } from "../components/forms/AnnouncementForm";
import { AsgmtAnalytics } from "../components/student-analytics/AsgmtAnalytics";
import { AddManualGradeColumn } from "../components/forms/AddManualGradeColumn";
import { EditManualGrade } from "../components/forms/EditManualGrade";
import CloneCourseForm from "../components/forms/CloneCourseForm.jsx";

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
          <Tab label="Roster" />
        </Tabs>
      </div>
      <div className="tabs-horiz-container">
        <Tabs
          className="tabs-horiz"
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
          <Tab label="Roster" />
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
      {tabIndex === 4 && <Grades course={course} user={user} />}
      {tabIndex === 5 && <Roster course={course} />}
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
  const [cloneOpen, setCloneOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const filePath = `courses/${course.id}/course_image/${file?.name}`;
  const courseImage = course.courseImage || null;

  function handleCloneOpen() {
    setCloneOpen(true);
  }

  function handleCloneClose() {
    setCloneOpen(false);
  }

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
                color="secondary"
                component="label"
                fullWidth
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
                <Button color="secondary" onClick={handleDeleteCourseImage}>
                  DELETE
                </Button>
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
      <CourseSummary course={course} handleOpen={handleCloneOpen} instructor />
      <br />
      <br />
      <CloneCourseForm
        course={course}
        open={cloneOpen}
        handleClose={handleCloneClose}
      />
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
            <Button
              color="secondary"
              onClick={handleOpen}
              startIcon={<AddIcon />}
              size="large"
            >
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
          <Button
            color="secondary"
            onClick={handleOpen}
            startIcon={<AddIcon />}
          >
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
            <Button
              color="secondary"
              onClick={handleOpen}
              startIcon={<AddIcon />}
              size="large"
            >
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
          <Button
            color="secondary"
            onClick={handleOpen}
            startIcon={<AddIcon />}
          >
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
            <Button
              color="secondary"
              onClick={handleOpen}
              startIcon={<AddIcon />}
              size="large"
            >
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
          <Button
            color="secondary"
            onClick={handleOpen}
            startIcon={<AddIcon />}
          >
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

function Grades({ course, user }) {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [asgmtInfo, setAsgmtInfo] = useState(null);
  const [asgmtInfoOpen, setAsgmtInfoOpen] = useState(false);
  const [manualGradeOpen, setManualGradeOpen] = useState(false);
  const [enterGradeOpen, setEnterGradeOpen] = useState(false);

  const cellStyle = {
    padding: "10px",
    textAlign: "left",
    maxWidth: "200px",
    minWidth: "140px",
  };

  const cellStyle2 = {
    padding: "10px",
    textAlign: "center",
    maxWidth: "140px",
    minWidth: "100px",
  };

  function downloadGradebook() {
    //adapted from https://medium.com/@idorenyinudoh10/how-to-export-data-from-javascript-to-a-csv-file-955bdfc394a9

    const asgmtIDs = assignments.map((asgmt) => asgmt.id);
    const asgmtTitles = assignments.map((asgmt) => asgmt.title);
    const points = assignments.map((asgmt) => asgmt.totalPointsPossible);

    const headers = ["First Name", "Last Name", ...asgmtTitles];
    const pointsRow = ["Points Possible", "", ...points];

    const gradebook = [];
    gradebook.push(headers);
    for (let i = 0; i < grades.length; i++) {
      const userGrades = grades[i];
      const asgmtScores = asgmtIDs.map(
        (asgmtID) => userGrades[asgmtID]?.totalPointsAwarded.toString() || "0"
      );
      const rowData = [
        userGrades.firstName,
        userGrades.lastName,
        ...asgmtScores,
      ];
      gradebook.push(rowData);
    }

    gradebook.push(pointsRow);

    let csvFormat = "";
    gradebook.forEach((row) => {
      csvFormat += row.join(",") + "\n";
    });

    const dateObj = new Date();
    const year = dateObj.getFullYear();
    let month = dateObj.getMonth() + 1;
    const date = dateObj.getDate();

    if (month < 10) {
      month = "0" + month;
    }

    const blob = new Blob([csvFormat], { type: "text/csv;charset=utf-8," });
    const objUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", objUrl);
    link.setAttribute(
      "download",
      `Gradebook-${course.title}-${year}-${month}-${date}.csv`
    );
    link.click();
    link.remove();
  }

  function openAsgmtInfo() {
    setAsgmtInfoOpen(true);
  }

  function closeAsgmtInfo() {
    setAsgmtInfoOpen(false);
  }

  function openManualGrade() {
    setManualGradeOpen(true);
  }

  function closeManualGrade() {
    setManualGradeOpen(false);
  }

  function openEnterGrade() {
    setEnterGradeOpen(true);
  }

  function closeEnterGrade() {
    setEnterGradeOpen(false);
  }

  useEffect(
    () => {
      fetchGrades(course.id, setGrades);
    },
    //eslint-disable-next-line
    []
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
      <Box sx={{ pt: "20px" }}>
        <BtnContainer right>
          <Tooltip title="add manually graded assignment">
            <Button
              color="secondary"
              onClick={openManualGrade}
              startIcon={<AddIcon />}
            >
              COLUMN
            </Button>
          </Tooltip>
          <Typography
            display="inline"
            sx={{ mx: 2, fontSize: "20px", color: "#d6e8ed" }}
          >
            |
          </Typography>
          <Button
            color="secondary"
            onClick={downloadGradebook}
            startIcon={<DownloadIcon />}
          >
            Download CSV
          </Button>
        </BtnContainer>
        <div className="gradebook-container">
          <table>
            <thead>
              <tr>
                <th
                  className="sticky sticky-top sticky-left"
                  style={{
                    zIndex: 2,
                    backgroundColor: "#c1dee5",
                    ...cellStyle,
                  }}
                >
                  Student
                </th>
                {assignments?.map((asgmt) => (
                  <th
                    className="sticky sticky-top"
                    key={asgmt.id}
                    style={{
                      backgroundColor: "#d6e8ed",
                      ...cellStyle2,
                    }}
                  >
                    {asgmt.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grades.map((userGrades, ind) => (
                <tr
                  key={userGrades.id}
                  style={{
                    zIndex: 1,
                    backgroundColor:
                      ind % 2 === 0 ? "rgba(95,161,181,0.1)" : "white",
                  }}
                >
                  <td
                    className="sticky sticky-left"
                    style={{
                      backgroundColor: ind % 2 === 0 ? "#e1ecef" : "white",
                      ...cellStyle,
                      zIndex: 1,
                    }}
                  >
                    {userGrades.firstName + " " + userGrades.lastName}
                  </td>
                  {assignments?.map((asgmt) => (
                    <td key={asgmt.id} style={cellStyle2}>
                      <GradebookCellInfo
                        asgmt={asgmt}
                        openAsgmtInfo={openAsgmtInfo}
                        openEnterGrade={openEnterGrade}
                        setAsgmtInfo={setAsgmtInfo}
                        userGrades={userGrades}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br />
      </Box>
      <AddManualGradeColumn
        course={course}
        handleClose={closeManualGrade}
        open={manualGradeOpen}
      />
      <EditManualGrade
        asgmt={asgmtInfo}
        course={course}
        open={enterGradeOpen}
        handleClose={closeEnterGrade}
      />
      <AsgmtAnalytics
        asgmt={asgmtInfo}
        course={course}
        open={asgmtInfoOpen}
        handleClose={closeAsgmtInfo}
        user={user}
      />
    </Panel>
  );
}

function GradebookCellInfo({
  asgmt,
  openAsgmtInfo,
  openEnterGrade,
  setAsgmtInfo,
  userGrades,
}) {
  const submissionExists = userGrades[asgmt.id] || false;

  if (asgmt.type === "manual entry") {
    const totalPointsAwarded = userGrades[asgmt.id]?.totalPointsAwarded || 0;
    const totalPointsPossible = asgmt.totalPointsPossible;

    return (
      <Link
        color="secondary"
        href="#"
        underline="none"
        onClick={() => {
          openEnterGrade();
          setAsgmtInfo({
            ...asgmt,
            userID: userGrades.id,
            userLastName: userGrades.lastName,
            userDisplayName: userGrades.firstName + " " + userGrades.lastName,
            totalPointsAwarded: totalPointsAwarded,
          });
        }}
      >
        {totalPointsAwarded} of {totalPointsPossible}
      </Link>
    );
  }

  if (submissionExists) {
    return (
      <Link
        color="secondary"
        href="#"
        underline="none"
        onClick={() => {
          openAsgmtInfo();
          setAsgmtInfo({
            ...asgmt,
            userID: userGrades.id,
            userLastName: userGrades.lastName,
            userDisplayName: userGrades.firstName + " " + userGrades.lastName,
            totalPointsAwarded: userGrades[asgmt.id].totalPointsAwarded,
          });
        }}
      >
        {formatGrade(asgmt, userGrades)}
      </Link>
    );
  }

  if (!submissionExists) {
    return (
      <span style={{ color: "gray" }}>{formatGrade(asgmt, userGrades)}</span>
    );
  }
}

function Roster({ course }) {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(
    () => fetchStudents(course.id, setStudents, setLoading),
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

  if (students?.length === 0) {
    return (
      <Panel center>
        <div style={{ position: "relative", bottom: "80px" }}>
          <Typography sx={{ mb: 2 }}>No students registered yet</Typography>
        </div>
      </Panel>
    );
  }

  if (students?.length > 0) {
    return (
      <Panel>
        <Box className="course-list-actions-container">
          <Typography sx={{ pl: 2 }} color="text.secondary">
            {students.length} students enrolled
          </Typography>
        </Box>

        <List className="course-item-list">
          {students.map((student) => (
            <div key={student.id}>
              <ListItem>
                <ListItemText
                  primary={student.firstName + " " + student.lastName}
                  secondary={student.email}
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
