import {
  Alert,
  Box,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import parse from "html-react-parser";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

export function AttemptCounter({ question, submissions }) {
  if (!question) return;

  const attemptsPossible = question?.attemptsPossible;
  const attemptsUsed = submissions?.length;
  const label = attemptsPossible === 1 ? "attempt" : "attempts";

  if (!attemptsPossible) return null;

  return (
    <Typography color="text.secondary" display="inline" sx={{ mb: 1 }}>
      {`${attemptsUsed} of ${attemptsPossible} ${label}`}
    </Typography>
  );
}

export function PromptPreview({ question }) {
  if (!question?.prompt) {
    return <div style={{ color: "gray" }}>{"(error rendering prompt)"}</div>;
  }
  return <div className="prompt">{parse(question.prompt)}</div>;
}

export function ClearSubmissions({ handleClick }) {
  return (
    <Link
      color="text.secondary"
      underline="hover"
      sx={{ cursor: "pointer" }}
      onClick={handleClick}
    >
      clear
    </Link>
  );
}

export function CorrectIndicator({
  attemptsExhausted,
  lastSubmission,
  submitting,
}) {
  const answeredCorrectly = lastSubmission?.answeredCorrectly;

  if (submitting || !lastSubmission) {
    return <div style={{ height: "37px" }}></div>;
  }

  if (answeredCorrectly) {
    return <Alert severity="success">Nicely Done</Alert>;
  }

  if (!attemptsExhausted && !answeredCorrectly) {
    return (
      <Alert icon={false} severity="error">
        Try again...
      </Alert>
    );
  }

  if (attemptsExhausted && !answeredCorrectly) {
    return (
      <Alert icon={false} severity="error">
        Out of attempts...
      </Alert>
    );
  }

  return <div style={{ height: "37px" }}></div>;
}

export function QuestionCardPanel({ children }) {
  return <Box className="right-panel">{children}</Box>;
}

export function QuestionsList({
  questions,
  selQuestion,
  setSelQuestion,
  submissionHistory,
}) {
  const listStyle = {
    padding: 0,
  };

  function pointsAwarded(question, submissionHistory) {
    if (!submissionHistory) {
      return 0;
    }

    const submissions = submissionHistory[question.id] || [];
    const lastSubmission = submissions?.at(-1) || null;
    const pointsAwarded = lastSubmission?.pointsAwarded || 0;
    return pointsAwarded;
  }

  function pointsPossible(question) {
    if (!question) {
      return "";
    } else {
      return question.pointsPossible > 1
        ? `${question.pointsPossible} points`
        : `${question.pointsPossible} point`;
    }
  }

  if (questions?.length == 0) {
    return null;
  }

  return (
    <List className="question-list" sx={listStyle}>
      {questions?.map((question, index) => (
        <ListItemButton
          key={question?.id}
          onClick={() => setSelQuestion(question)}
          sx={{
            bgcolor:
              question?.id === selQuestion?.id
                ? "rgba(0,180,235,0.1)"
                : "transparent",
          }}
        >
          <ListItemText
            primary={`Question ${index + 1}`}
            secondary={
              pointsAwarded(question, submissionHistory) +
              " of " +
              pointsPossible(question)
            }
          />
        </ListItemButton>
      ))}
    </List>
  );
}

export function QuestionNav({ qIndex, questions, setSelQuestion }) {
  if (questions.length === 0) {
    return null;
  }

  function goBack() {
    setSelQuestion(() => questions[qIndex - 1]);
  }

  function goForward() {
    setSelQuestion(() => questions[qIndex + 1]);
  }

  const leftArrowDisabled = qIndex <= 0;
  const rightArrowDisabled = qIndex + 1 >= questions.length;

  return (
    <div className="question-nav">
      <div>
        <IconButton disabled={leftArrowDisabled} onClick={goBack}>
          <ArrowLeftIcon />
        </IconButton>
        <Typography display="inline" sx={{ position: "relative", top: 2 }}>
          Question {qIndex + 1} of {questions.length}
        </Typography>
        <IconButton disabled={rightArrowDisabled} onClick={goForward}>
          <ArrowRightIcon />
        </IconButton>
      </div>
    </div>
  );
}

export function QSetContainer({ children }) {
  return <div className="question-set-container">{children}</div>;
}
