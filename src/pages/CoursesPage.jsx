import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  LoadingIndicator,
  Page,
  PageHeader,
} from "../components/common/Pages.jsx";
import { AddCourseForm } from "../components/forms/AddCourseForm.jsx";
import { fetchCourses, fetchUserInfo } from "../utils/firestoreClient.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function CoursesPage() {
  const navigate = useNavigate();

  // user is the auth credentials returned from firebase auth, userInfo are extra details about the user from firestore
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  // function redirectToCourse(course) {
  //   const courseTitle = course.title.replace(/\s/g, "-");
  //   navigate(
  //     `/classroom/courses/${courseTitle}/${course.id}/instructor/dashboard`
  //   );
  // }

  useEffect(() => {
    if (!user) return;
    fetchUserInfo(user, setUserInfo);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchCourses(user, setCourses, setLoading);
  }, [user]);

  if (loading || !userInfo) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader title="Courses" />
      {courses.length === 0 && <NoCoursesYet handleOpen={handleOpen} />}
      {courses.length > 0 && (
        <Box className="flex flex-wrap flex-center" sx={{ px: 2 }}>
          {courses.map((course) => (
            <InstructorCourseCard
              course={course}
              key={course.id}
              onClick={() => {
                const courseTitle = course.title.replace(/\s/g, "-");
                navigate(
                  `/classroom/courses/${courseTitle}/${course.id}/instructor/dashboard`
                );
              }}
            />
          ))}
          <NewCourseCard onClick={handleOpen} />
        </Box>
      )}
      <AddCourseForm
        open={open}
        handleClose={handleClose}
        userInfo={userInfo}
        user={user}
      />
    </Page>
  );
}

function NoCoursesYet({ handleOpen }) {
  return (
    <Box className="flex flex-col flex-center" sx={{ minHeight: "60vh" }}>
      <Typography sx={{ p: 1 }}>
        Teaching is more than imparting knowledge, it is inspiring change.
      </Typography>
      <Typography sx={{ pb: 3 }}>- William Aruther Ward</Typography>
      <Button onClick={handleOpen} startIcon={<AddIcon />} variant="contained">
        ADD COURSE
      </Button>
    </Box>
  );
}

function InstructorCourseCard({ course, onClick }) {
  return (
    <Card sx={{ width: 300, height: 300, m: 2 }}>
      <CardActionArea onClick={onClick}>
        <CardMedia
          component="img"
          height="190"
          image={import.meta.env.VITE_COURSE_CARD_IMG}
          alt="pond lotus flower"
        />
        <CardContent sx={{ height: 210 }}>
          <Typography variant="h6">{course.title}</Typography>
          <Typography>{course.description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function NewCourseCard({ onClick }) {
  const cardStyle = {
    width: 300,
    height: 300,
    m: 2,
    bgcolor: "transparent",
    outline: "solid #026c8c",
  };
  return (
    <Card sx={cardStyle}>
      <CardActionArea onClick={onClick}>
        <Box sx={{ height: "300px" }} className="flex flex-row flex-center">
          <AddIcon color="primary" />
          <Typography variant="h5" color="primary" sx={{ ml: 1 }}>
            Add Course
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
}
