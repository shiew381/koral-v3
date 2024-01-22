import { Box, Button, Typography } from "@mui/material";
import { formatInstructorNames } from "../../utils/commonUtils";
import { formatDate } from "../../utils/dateUtils";
import ImageIcon from "@mui/icons-material/Image";
import ArticleIcon from "@mui/icons-material/Article";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import LinkIcon from "@mui/icons-material/Link";

export function AssignmentIcon({ type }) {
  switch (type) {
    case "question set": {
      return <AppRegistrationIcon />;
    }
    default:
      return null;
  }
}

export function Panel({ children, center }) {
  if (center) {
    return (
      <Box className="flex flex-col flex-grow flex-center">{children}</Box>
    );
  }

  return (
    <Box className="flex flex-col flex-grow flex-align-center">{children}</Box>
  );
}

export function CourseImage({ url }) {
  return (
    <img
      src={url || import.meta.env.VITE_COURSE_CARD_IMG}
      alt="pond lotus flower"
      width="100%"
    />
  );
}

export function CourseSummary({ course, handleOpen, instructor }) {
  const showCourseCode = instructor && course.availableTo === "invited";
  const showCloneCourse = instructor;

  if (!course) return null;

  return (
    <table>
      <tbody>
        <Row>
          <Cell right>
            <Typography>
              {course.instructorNames?.length > 1
                ? "instructors:"
                : "instructor:"}
            </Typography>
          </Cell>
          <Cell padLeft>
            <Typography>{formatInstructorNames(course.instructors)}</Typography>
          </Cell>
        </Row>
        <Row>
          <Cell right>
            <Typography>available to:</Typography>
          </Cell>
          <Cell padLeft>
            <Typography>
              {course.availableTo === "invited"
                ? "invited students"
                : `${import.meta.env.VITE_COMMUNITY_NAME}`}
            </Typography>
          </Cell>
        </Row>
        {showCourseCode && (
          <Row>
            <Cell right>
              <Typography>course code: </Typography>
            </Cell>
            <Cell padLeft>
              <Typography>{course.courseCode}</Typography>
            </Cell>
          </Row>
        )}
        <Row>
          <Cell right>
            <Typography>created:</Typography>
          </Cell>
          <Cell padLeft>
            <Typography>{formatDate(course.dateCreated)}</Typography>
          </Cell>
        </Row>
        {showCloneCourse && (
          <Row>
            <Cell right>actions:</Cell>
            <td
              style={{ paddingLeft: "10px", position: "relative", top: "3px" }}
            >
              <Button color="secondary" onClick={handleOpen}>
                CLONE COURSE
              </Button>
            </td>
          </Row>
        )}
      </tbody>
    </table>
  );
}

export function ResourceIcon({ type }) {
  switch (type) {
    case "document": {
      return <ArticleIcon />;
    }
    case "image": {
      return <ImageIcon />;
    }
    case "link": {
      return <LinkIcon />;
    }
    default:
      return null;
  }
}

function Row({ children }) {
  return <tr>{children}</tr>;
}

function Cell({ children, right, padLeft }) {
  if (right) {
    return <td style={{ textAlign: "right", padding: "4px" }}>{children}</td>;
  }

  if (padLeft) {
    return <td style={{ paddingLeft: "20px" }}>{children}</td>;
  }

  return <td>{children}</td>;
}
