import { useEffect, useState } from "react";
import { db } from "../../config/firebaseConfig.js";
import { getDocs, collection, query, where } from "firebase/firestore";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { Lightbox, LightboxHeader } from "../common/Lightbox.jsx";
import { BtnContainer, SubmitBtn } from "../common/Buttons.jsx";
import {
  CourseDescriptionField,
  SearchField,
  CourseTitleField,
} from "../common/InputFields.jsx";
import {
  formatInstructorNames,
  generateRandomCode,
  searchifyStr,
} from "../../utils/commonUtils.js";
import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import { addCourse, addStudentToCourse } from "../../utils/firestoreClient.js";

export function AddCourseForm({ user, userInfo, open, handleClose }) {
  const firstName = userInfo?.firstName || "";
  const lastName = userInfo?.lastName || "";
  const firstNameNormalized = firstName.trim().toLowerCase();
  const lastNameNormalized = lastName.trim().toLowerCase();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("student");
  const [availableTo, setAvailableTo] = useState("invited");
  const [searchTerm, setSearchTerm] = useState("");
  const [foundCourses, setFoundCourses] = useState([]);
  const [noSearchResults, setNoSearchResults] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleRole = (e) => setRole(e.target.value);
  const handleAvailableTo = (e) => setAvailableTo(e.target.value);
  const changeTitle = (e) => setTitle(e.target.value);
  const changeDescription = (e) => setDescription(e.target.value);

  function handleNext() {
    setStep(step + 1);
  }

  function handleBack() {
    setStep(step - 1);
  }

  function handleSearchTerm(e) {
    setSearchTerm(e.target.value);
    setNoSearchResults(false);
  }

  function handleEnter(e) {
    if (e.code === "Enter") {
      findCourse();
    }
  }

  function createNewCourse() {
    const values = {
      title: title,
      title_searchable: searchifyStr(title),
      courseCode: generateRandomCode(6),
      description: description,
      instructors: [
        {
          id: user.uid,
          email: userInfo.email,
          firstName: firstName,
          lastName: lastName,
        },
      ],
      instructorIDs: [user.uid],
      instructorNames_searchable: [firstNameNormalized, lastNameNormalized],
      studentIDs: [],
      availableTo: availableTo,
    };

    addCourse(values, handleClose, setSubmitting);
  }

  function registerStudent(course) {
    const studentInfo = {
      id: user.uid,
      email: userInfo.email,
      firstName: firstName,
      lastName: lastName,
    };

    addStudentToCourse(course, studentInfo, handleClose, setSubmitting);
  }

  async function findCourse() {
    const fetchedItems = [];
    const uniqueCourses = [];
    const ref = collection(db, "courses");
    const q1 = query(
      ref,
      where(
        "instructorNames_searchable",
        "array-contains",
        searchTerm.trim().toLowerCase()
      )
    );

    const q2 = query(
      ref,
      where(
        "title_searchable",
        "array-contains",
        searchTerm.trim().toLowerCase()
      )
    );

    setSearching(true);

    const querySnapshot1 = await getDocs(q1);
    const querySnapshot2 = await getDocs(q2);

    querySnapshot1.forEach((doc) =>
      fetchedItems.push({
        id: doc.id,
        ...doc.data(),
      })
    );

    querySnapshot2.forEach((doc) =>
      fetchedItems.push({
        id: doc.id,
        ...doc.data(),
      })
    );

    const foundCourseIDs = fetchedItems.map((item) => item.id);

    if (foundCourseIDs.length === 0) {
      setNoSearchResults(true);
      setFoundCourses([]);
      setSearching(false);
      return;
    }
    console.log("reached here");
    const uniqueCourseIDs = new Set(foundCourseIDs);

    uniqueCourseIDs.forEach((courseID) => {
      const course = fetchedItems.find((item) => item.id === courseID);
      uniqueCourses.push(course);
    });

    console.log(uniqueCourses);

    setFoundCourses(uniqueCourses);
    setSearching(false);
  }

  function resetForm() {
    console.log("resetting");
    setStep(1);
    setRole("student");
    setTitle("");
    setSearchTerm("");
    setDescription("");
    setFoundCourses([]);
    setNoSearchResults(false);
    setSubmitting(false);
  }

  useEffect(() => {
    resetForm;
  }, [open]);

  return (
    <Lightbox open={open} onClose={handleClose}>
      <LightboxHeader title="ADD COURSE" />
      {step === 1 && (
        <>
          <FormControl sx={{ px: 5 }}>
            <FormLabel>Choose a role</FormLabel>
            <RadioGroup value={role} onChange={handleRole}>
              <FormControlLabel
                control={<Radio />}
                label="Student"
                value="student"
              />
              <FormControlLabel
                control={<Radio />}
                label="Instructor"
                value="instructor"
              />
            </RadioGroup>
          </FormControl>
          <BtnContainer right>
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          </BtnContainer>
        </>
      )}
      {step === 2 && role === "student" && (
        <>
          <FormControl sx={{ width: "100%" }} variant="outlined">
            <SearchField
              onClick={findCourse}
              onChange={handleSearchTerm}
              placeholder="course title or instructor name"
              value={searchTerm}
              onKeyUp={handleEnter}
            />
          </FormControl>
          {noSearchResults && (
            <Box className="flex flex-center" sx={{ pt: "40px" }}>
              no courses found
            </Box>
          )}

          {foundCourses.length > 0 && (
            <List sx={{ mt: "10px" }}>
              {foundCourses.map((course) => (
                <FoundCourse
                  key={course.id}
                  course={course}
                  registerStudent={registerStudent}
                  user={user}
                />
              ))}
            </List>
          )}
          {searching && (
            <Box className="flex flex-center" sx={{ pt: "40px" }}>
              <CircularProgress />
            </Box>
          )}
          <br />
          <br />
          <BtnContainer left>
            <Button onClick={handleBack}>BACK</Button>
          </BtnContainer>
        </>
      )}
      {step === 2 && role === "instructor" && (
        <>
          <CourseTitleField onChange={changeTitle} value={title} />
          <CourseDescriptionField
            onChange={changeDescription}
            value={description}
          />
          <FormControl sx={{ p: 2 }}>
            <FormLabel>Make the course available to:</FormLabel>
            <RadioGroup value={availableTo} onChange={handleAvailableTo}>
              <FormControlLabel
                control={<Radio />}
                label="invited students only"
                value="invited"
              />
              <FormControlLabel
                control={<Radio />}
                label={`${import.meta.env.VITE_COMMUNITY_NAME} community`}
                value="community"
              />
            </RadioGroup>
          </FormControl>

          <BtnContainer split>
            <Button onClick={handleBack}>BACK</Button>
            <SubmitBtn
              label="ADD COURSE"
              onClick={createNewCourse}
              disabled={submitting}
              submitting={submitting}
            />
          </BtnContainer>
        </>
      )}
    </Lightbox>
  );
}

function FoundCourse({ course, registerStudent, user }) {
  const [courseCode, setCourseCode] = useState("");

  function handleCourseCode(e) {
    setCourseCode(e.target.value);
  }

  if (course.instructorIDs?.includes(user.uid)) {
    return (
      <ListItem>
        <ListItemText
          primary={course.title}
          secondary="You're the instructor"
        />
      </ListItem>
    );
  }

  if (course.studentIDs?.includes(user.uid)) {
    return (
      <ListItem>
        <ListItemText
          primary={course.title}
          secondary="You're registered for this course."
        />
      </ListItem>
    );
  }

  return (
    <>
      <ListItem
        secondaryAction={
          course.availableTo === "invited" &&
          courseCode !== course.courseCode ? (
            <Button disabled startIcon={<LockIcon />}>
              ADD COURSE
            </Button>
          ) : (
            <Button
              onClick={() => registerStudent(course)}
              startIcon={<AddIcon />}
            >
              ADD COURSE
            </Button>
          )
        }
      >
        <ListItemText
          primary={course.title}
          secondary={"instructor: " + formatInstructorNames(course.instructors)}
        />
      </ListItem>
      <Box
        className="flex flex-end"
        sx={{ pr: "20px", position: "relative", bottom: "15px" }}
      >
        <TextField
          placeholder="course code"
          variant="outlined"
          sx={{ width: "120px" }}
          size="small"
          onChange={handleCourseCode}
        />
      </Box>
    </>
  );
}
