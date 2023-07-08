import { useEffect, useState } from "react";
import { db } from "../../config/firebaseConfig.js";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Radio,
  RadioGroup,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Lightbox, LightboxHeader } from "../common/Lightbox.jsx";
import { BtnContainer, SubmitBtn } from "../common/Buttons.jsx";
import {
  CourseDescriptionField,
  CourseTitleField,
} from "../common/InputFields.jsx";
import { generateRandomCode } from "../../utils/commonUtils.js";

export function AddCourseForm({ user, userInfo, open, handleClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("student");
  const [availableTo, setAvailableTo] = useState("invited");

  const handleRole = (e) => setRole(e.target.value);
  const handleAvailableTo = (e) => setAvailableTo(e.target.value);
  const changeTitle = (e) => setTitle(e.target.value);
  const changeDescription = (e) => setDescription(e.target.value);
  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  function resetForm() {
    setTimeout(() => {
      setStep(1);
      setRole("student");
      setTitle("");
      setDescription("");
      setSubmitting(false);
    }, 500);
  }

  useEffect(resetForm, [open]);

  function addCourse() {
    const firstName = userInfo?.firstName || "";
    const lastName = userInfo?.lastName || "";
    const firstNameNormalized = firstName.trim().toLowerCase();
    const lastNameNormalized = lastName.trim().toLowerCase();

    const ref = collection(db, "courses");
    setSubmitting(true);
    addDoc(ref, {
      title: title,
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
      availableTo: availableTo,
      dateCreated: serverTimestamp(),
    })
      .then(() => {
        setTimeout(() => setSubmitting(false), 500);
        setTimeout(() => handleClose(), 500);
      })
      .catch((error) => {
        console.log(error);
        setTimeout(() => setSubmitting(false), 500);
      });
  }

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
            <OutlinedInput
              id="search-courses"
              placeholder="course title or instructor name"
              // value={values.password}
              // onChange={handleChange("password")}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    // onClick={handleClickShowPassword}
                    edge="end"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
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
              onClick={addCourse}
              disabled={submitting}
              submitting={submitting}
            />
          </BtnContainer>
        </>
      )}
    </Lightbox>
  );
}
