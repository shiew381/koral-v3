import { useEffect, useState } from "react";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { TitleField } from "../common/InputFields";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import {
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { generateRandomCode } from "../../utils/commonUtils";
import {
  cloneCourse,
  getAssignmentsForCloning,
  getResourcesForCloning,
} from "../../utils/firestoreClient";
import { useNavigate } from "react-router-dom";

export default function CloneCourseForm({ course, open, handleClose }) {
  const [title, setTitle] = useState(`${course?.title} - clone` || "");
  const [submitting, setSubmitting] = useState(false);
  const [resources, setResources] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  function handleTitle(e) {
    setTitle(e.target.value);
  }

  function handleSubmit() {
    const newCourseValues = {
      title: title,
      title_searchable: course.title_searchable,
      description: course.description,
      availableTo: course.availableTo,
      courseCode: generateRandomCode(5),
      instructors: course.instructors,
      instructorNames_searchable: course.instructorNames_searchable,
      instructorIDs: course.instructorIDs,
      studentIDs: [],
      clonedFrom: {
        id: course.id,
        title: course?.title || "",
      },
    };

    cloneCourse(
      newCourseValues,
      resources,
      assignments,
      setSubmitting,
      setSuccess
    );
    // addUserLink(user, values, setSubmitting, handleClose);
  }

  async function redirectToCourses() {
    navigate("/classroom/courses");
  }

  function resetForm() {
    setTitle(`${course?.title} - clone` || "");
    setSuccess(false);
  }

  useEffect(() => {
    resetForm();
    if (open) {
      getResourcesForCloning(course, setResources);
      getAssignmentsForCloning(course, setAssignments);
    }
  }, [open]);

  return (
    <Lightbox
      open={open}
      onClose={handleClose}
      customStyle={{ maxWidth: "600px" }}
    >
      <LightboxHeader title="Clone Course" />
      <TitleField onChange={handleTitle} value={title} />
      <br />
      <br />
      <Typography sx={{ pl: "10px" }}>Cloning this course will:</Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="Create a new course with a new course code" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Copy all instructors" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Copy all resources and assignments" />
        </ListItem>
      </List>
      <Typography sx={{ pl: "10px" }}>Please note:</Typography>
      <List dense>
        <ListItem>
          <ListItemText primary="Student assignment submissions and grades will NOT be copied over. Students will have to enroll in the new course manually." />
        </ListItem>
        <ListItem>
          <ListItemText primary="Assignment open and due date setting will be copied without modification. You will need to change them manually." />
        </ListItem>
        <ListItem>
          <ListItemText primary="You will need to upload a new course thumbnail." />
        </ListItem>
      </List>

      {success ? (
        <Alert
          severity="success"
          action={<Button onClick={redirectToCourses}>View My Courses</Button>}
        >
          Successfully cloned.
        </Alert>
      ) : (
        <BtnContainer right>
          <SubmitBtn
            label="CLONE"
            onClick={handleSubmit}
            disabled={submitting}
            submitting={submitting}
          />
        </BtnContainer>
      )}
    </Lightbox>
  );
}
