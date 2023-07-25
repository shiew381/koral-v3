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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
  mode,
  submitting,
}) {
  const answeredCorrectly = lastSubmission?.answeredCorrectly;

  if (mode === "preview") {
    return null;
  }

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

export function QuestionList({
  draggable,
  handleDragEnd,
  questions,
  selQuestion,
  setSelQuestion,
  submissionHistory,
}) {
  const listStyle = {
    padding: 0,
  };

  if (questions?.length == 0) {
    return null;
  }

  if (draggable) {
    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable-questions" type="question">
          {(provided) => (
            <List
              sx={listStyle}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {questions?.map((question, index) => (
                <QuestionListItem
                  draggable
                  handleClick={() => setSelQuestion(question)}
                  key={question.id}
                  question={question}
                  index={index}
                  selected={question.id === selQuestion?.id}
                  submissionHistory={submissionHistory}
                />
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  if (!draggable) {
    return (
      <List className="question-list" sx={listStyle}>
        {questions?.map((question, index) => (
          <QuestionListItem
            draggable={false}
            handleClick={() => setSelQuestion(question)}
            key={question.id}
            question={question}
            index={index}
            selected={question.id === selQuestion?.id}
            submissionHistory={submissionHistory}
          />
        ))}
      </List>
    );
  }
}

function QuestionListItem({
  draggable,
  question,
  index,
  selected,
  handleClick,
  submissionHistory,
}) {
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

  if (draggable) {
    return (
      <Draggable draggableId={question.id} index={index}>
        {(provided) => (
          <ListItemButton
            key={question?.id}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={handleClick}
            sx={{
              bgcolor: selected ? "rgba(0,180,235,0.1)" : "transparent",
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
            {provided.placeholder}
          </ListItemButton>
        )}
      </Draggable>
    );
  }

  if (!draggable) {
    return (
      <ListItemButton
        key={question?.id}
        onClick={handleClick}
        sx={{
          bgcolor: selected ? "rgba(0,180,235,0.1)" : "transparent",
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
    );
  }
}

export function QuestionNav({
  backDisabled,
  goBack,
  goForward,
  nextDisabled,
  qIndex,
  questions,
}) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="question-nav">
      <div>
        <IconButton disabled={backDisabled} onClick={goBack}>
          <ArrowLeftIcon />
        </IconButton>
        <Typography display="inline" sx={{ position: "relative", top: 2 }}>
          Question {qIndex + 1} of {questions.length}
        </Typography>
        <IconButton disabled={nextDisabled} onClick={goForward}>
          <ArrowRightIcon />
        </IconButton>
      </div>
    </div>
  );
}

export function QSetContainer({ children }) {
  return <div className="question-set-container">{children}</div>;
}
