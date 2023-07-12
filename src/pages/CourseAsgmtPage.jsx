import { useNavigate, useParams } from "react-router-dom";
import { Page } from "../components/common/Pages";
import { Box, Button, List, ListItemButton, ListItemText } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

export default function CourseAsgmtPage() {
  const questions = ["a", "b", "c"];

  return (
    <Page>
      <BackToStudentDashboard />
      <QSetContainer>
        <QuestionsList
          //   qSet={qSet}
          questions={questions}
          //   selQuestion={selQuestion}
          //   setSelQuestion={setSelQuestion}
        />
      </QSetContainer>
    </Page>
  );
}

function QuestionsList({ questions, selQuestion, setSelQuestion }) {
  const listStyle = {
    height: "465px",
    overflow: "auto",
    padding: 0,
  };

  if (questions.length == 0) return null;

  return (
    <Box className="questions-list">
      <List sx={listStyle}>
        {questions.map((question, index) => (
          <QuestionListItem
            handleClick={() => setSelQuestion(question)}
            key={question.id}
            // qSet={qSet}
            // question={question}
            index={index}
            selected={question.id === selQuestion?.id}
          />
        ))}
      </List>
    </Box>
  );
}

function QuestionListItem({ index, selected, handleClick }) {
  const btnColor = selected ? "rgba(0,180,235,0.1)" : "transparent";

  //   const submissions = getSubmissions(qSet, question) || [];
  //   const lastSubmission = submissions?.at(-1) || null;
  //   const pointsAwarded = lastSubmission?.pointsAwarded || 0;

  //   const pointsPossible =
  //     question.pointsPossible > 1
  //       ? `${question.pointsPossible} points`
  //       : `${question.pointsPossible} point`;

  return (
    <ListItemButton onClick={handleClick} sx={{ bgcolor: btnColor }}>
      <ListItemText
        primary={`Question ${index + 1}`}
        // secondary={`${pointsAwarded} of ${pointsPossible}`}
      />
    </ListItemButton>
  );
}

function QSetContainer({ children }) {
  return (
    <div
      className="flex flex-row flex-justify-center"
      style={{ maxWidth: "100vw", minHeight: "300px" }}
    >
      {children}
    </div>
  );
}

export function BackToStudentDashboard() {
  const navigate = useNavigate();
  const { courseID, title } = useParams();

  function redirectToStudentDashboard() {
    navigate(`/classroom/courses/${title}/${courseID}/student/dashboard`);
  }

  return (
    <div className="page-actions">
      <Button
        startIcon={<ChevronLeftIcon />}
        onClick={redirectToStudentDashboard}
      >
        Course Dashboard
      </Button>
    </div>
  );
}
