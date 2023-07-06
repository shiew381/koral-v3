import { Tabs } from "@mui/material";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { formatNames } from "../../utils/commonUtils";
import { formatDate } from "../../utils/dateUtils";

export function CourseImage() {
  return (
    <img
      src={import.meta.env.VITE_COURSE_CARD_IMG}
      alt="pond lotus flower"
      width="320px"
    />
  );
}

export function CourseTabs({ children, handleChange, value }) {
  const tabsStyle = {
    borderRight: 1,
    borderColor: "divider",
    maxWidth: "200px",
  };

  return (
    <Tabs
      orientation="vertical"
      variant="scrollable"
      value={value}
      onChange={handleChange}
      sx={tabsStyle}
    >
      {children}
    </Tabs>
  );
}

export function CourseSummary({ course }) {
  if (!course) return null;
  return (
    <Stack sx={{ ml: "30px" }}>
      <Typography variant="h4" color="primary" id="course-title">
        {course.title}
      </Typography>
      <Typography>{course.description}</Typography>
      <Divider />
      <table style={{ marginLeft: "5px" }}>
        <tbody>
          <tr>
            <td>
              <Typography>
                {course.instructorNames?.length > 1
                  ? "instructors:"
                  : "instructor:"}
              </Typography>
            </td>
            <td style={{ paddingLeft: "20px" }}>
              <Typography>{formatNames(course.instructorNames)}</Typography>
            </td>
          </tr>
          <tr>
            <td>
              <Typography>available to:</Typography>
            </td>
            <td style={{ paddingLeft: "20px" }}>
              <Typography>
                {course.availableTo === "invited"
                  ? "invited students"
                  : `${import.meta.env.REACT_APP_COMMUNITY_NAME}`}
              </Typography>
            </td>
          </tr>
          <tr>
            <td>
              <Typography>created</Typography>
            </td>
            <td style={{ paddingLeft: "20px" }}>
              <Typography>{formatDate(course.created.toDate())}</Typography>
            </td>
          </tr>
        </tbody>
      </table>
    </Stack>
  );
}

export function LowerContainer({ children }) {
  <Box className="flex flex-row">{children}</Box>;
}
