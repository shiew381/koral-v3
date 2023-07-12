import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Button,
  Card,
  Divider,
  Link,
  List,
  ListItemButton,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { getSubmissions } from "../utils/questionSetUtils";
import { deleteQuestion, fetchUserQSet } from "../utils/firestoreClient";
import { VertDivider } from "../components/common/Dividers";
import { Page, PageHeader, LoadingIndicator } from "../components/common/Pages";
import {
  AttemptsForm,
  PointsForm,
  QuestionBuilder,
} from "../components/forms/QnBuilder";
import MultipleChoice from "../components/question-sets/QnMultipleChoice";
import ShortAnswer from "../components/question-sets/QnShortAnswer";
import "../css/QuestionSetPage.css";
import FreeResponse from "../components/question-sets/QnFreeResponse";

export default function QuestionSetPage() {
  const { user } = useAuth();
  const { qSetID } = useParams();

  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState("preview");
  const [edit, setEdit] = useState(false);
  const [openAttempts, setOpenAttempts] = useState(false);
  const [openPoints, setOpenPoints] = useState(false);

  const [qSet, setQSet] = useState(null);
  const [selQuestion, setSelQuestion] = useState(null);
  const questions = qSet?.questions || [];

  const [openBuilder, setOpenBuilder] = useState(false);

  const qIndex = questions.findIndex((el) =>
    selQuestion ? el.id === selQuestion.id : 0
  );

  function handleAddQuestion() {
    setOpenBuilder(true);
    setEdit(false);
  }

  function handleCloseAttempts() {
    setOpenAttempts(false);
  }

  function handleCloseBuilder() {
    setOpenBuilder(false);
    setEdit(false);
  }

  function handleClosePoints() {
    setOpenPoints(false);
  }

  function handleDeleteQuestion() {
    deleteQuestion(selQuestion, qIndex, qSet, user, setSelQuestion);
  }

  function handleEditQuestion() {
    setOpenBuilder(true);
    setEdit(true);
  }

  function handleOpenAttempts() {
    setOpenAttempts(true);
  }

  function handleOpenPoints() {
    setOpenPoints(true);
  }

  function handleMode(e, value) {
    if (value) {
      setMode(value);
    }
  }

  useEffect(
    () => {
      if (!user) return;
      fetchUserQSet(user, qSetID, setQSet, setLoading);
    },
    //eslint-disable-next-line
    [user]
  );

  if (loading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );
  }

  return (
    <Page>
      <BackToQSets />
      <Box sx={{ px: 2 }}>
        <PageHeader title={qSet?.title} />
        <Divider />
        <div className="title-preview-spacer"></div>
        <PreviewContainer>
          <GetStarted
            handleAddQuestion={handleAddQuestion}
            loading={loading}
            questions={questions}
          />
          <QuestionsList
            handleAddQuestion={handleAddQuestion}
            qSet={qSet}
            questions={questions}
            selQuestion={selQuestion}
            setSelQuestion={setSelQuestion}
          />

          <RightPanel selQuestion={selQuestion} questions={questions}>
            {questions.length > 0 && (
              <ToggleButtonGroup
                color="primary"
                exclusive
                onChange={handleMode}
                size="small"
                sx={{ position: "absolute", top: -47, right: 0 }}
                value={mode}
              >
                <ToggleButton value="preview">Preview</ToggleButton>
                <ToggleButton value="test">Test</ToggleButton>
              </ToggleButtonGroup>
            )}
            <QuestionCard
              handleOpenPoints={handleOpenPoints}
              handleOpenAttempts={handleOpenAttempts}
              handleEditQuestion={handleEditQuestion}
              mode={mode}
              qSet={qSet}
              question={selQuestion}
              user={user}
            />
            <br />
            {selQuestion && (
              <Box align="center">
                <Button onClick={handleDeleteQuestion}>Delete Question</Button>
              </Box>
            )}
          </RightPanel>
        </PreviewContainer>
      </Box>

      <QuestionBuilder
        edit={edit}
        handleClose={handleCloseBuilder}
        open={openBuilder}
        qSet={qSet}
        selQuestion={edit ? selQuestion : null}
        setEdit={setEdit}
        setSelQuestion={setSelQuestion}
        user={user}
      />
      <PointsForm
        handleClose={handleClosePoints}
        open={openPoints}
        qSet={qSet}
        selQuestion={selQuestion}
        setSelQuestion={setSelQuestion}
        user={user}
      />
      <AttemptsForm
        handleClose={handleCloseAttempts}
        open={openAttempts}
        qSet={qSet}
        selQuestion={selQuestion}
        setSelQuestion={setSelQuestion}
        user={user}
      />
    </Page>
  );
}

export function BackToQSets() {
  const navigate = useNavigate();
  function navigateToQSets() {
    navigate("/content/question-sets");
  }

  return (
    <div className="page-actions">
      <Button startIcon={<ChevronLeftIcon />} onClick={navigateToQSets}>
        All Question Sets
      </Button>
    </div>
  );
}

function PreviewContainer({ children }) {
  return (
    <div
      className="flex flex-row flex-justify-center"
      style={{ maxWidth: "100vw", minHeight: "300px" }}
    >
      {children}
    </div>
  );
}

function GetStarted({ loading, questions, handleAddQuestion }) {
  if (loading) {
    return null;
  }

  if (questions.length > 0) {
    return null;
  }

  return (
    <Box display="block">
      <Typography
        align="center"
        color="primary"
        sx={{ mt: "120px", mb: "20px" }}
      >
        Amazing questions are waiting to be written!
      </Typography>
      <Box display="flex" sx={{ justifyContent: "center" }}>
        <Button
          align="center"
          color="primary"
          onClick={handleAddQuestion}
          size="large"
        >
          <AddIcon />
          ADD QUESTION
        </Button>
      </Box>
    </Box>
  );
}

function QuestionsList({
  handleAddQuestion,
  qSet,
  questions,
  selQuestion,
  setSelQuestion,
}) {
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
            qSet={qSet}
            question={question}
            index={index}
            selected={question.id === selQuestion?.id}
          />
        ))}
      </List>
      <Divider sx={{ width: "190px", mt: 1 }} />
      <Box className="add-question-container">
        <Button
          fullWidth
          startIcon={<AddIcon />}
          onClick={handleAddQuestion}
          sx={{ borderRadius: 0 }}
        >
          ADD QUESTION
        </Button>
      </Box>
    </Box>
  );
}

function QuestionListItem({ qSet, question, index, selected, handleClick }) {
  const btnColor = selected ? "rgba(0,180,235,0.1)" : "transparent";

  const submissions = getSubmissions(qSet, question) || [];
  const lastSubmission = submissions?.at(-1) || null;
  const pointsAwarded = lastSubmission?.pointsAwarded || 0;

  const pointsPossible =
    question.pointsPossible > 1
      ? `${question.pointsPossible} points`
      : `${question.pointsPossible} point`;

  return (
    <ListItemButton onClick={handleClick} sx={{ bgcolor: btnColor }}>
      <ListItemText
        primary={`Question ${index + 1}`}
        secondary={`${pointsAwarded} of ${pointsPossible}`}
      />
    </ListItemButton>
  );
}

function QuestionCard({
  handleEditQuestion,
  handleOpenPoints,
  handleOpenAttempts,
  mode,
  qSet,
  question,
  user,
}) {
  if (!question) {
    return null;
  }

  if (question) {
    const { type } = question;

    const cardStyle = {
      bgcolor: "rgba(255,255,255,0.2)",
      display: "flex",
      flexDirection: "column",
    };

    return (
      <Card sx={cardStyle} className="question-card">
        {mode === "preview" && (
          <Box className="question-card-actions">
            <Points question={question} handleClick={handleOpenPoints} />
            <VertDivider question={question} />
            <Attempts question={question} handleClick={handleOpenAttempts} />
            <VertDivider show />
            <Button
              onClick={handleEditQuestion}
              startIcon={<EditIcon />}
              sx={{ p: 1, mr: 1 }}
            >
              EDIT
            </Button>
          </Box>
        )}

        {type === "multiple choice" && (
          <MultipleChoice
            mode={mode}
            qSet={qSet}
            question={question}
            user={user}
          />
        )}
        {type === "short answer" && (
          <ShortAnswer
            mode={mode}
            question={question}
            qSet={qSet}
            user={user}
          />
        )}
        {type == "free response" && (
          <FreeResponse
            mode={mode}
            question={question}
            qSet={qSet}
            user={user}
          />
        )}
      </Card>
    );
  }
}

function Points({ question, handleClick }) {
  if (!question) return;

  const pointsPossible = question.pointsPossible;
  const label = pointsPossible === 1 ? "point" : "points";

  return (
    <Link onClick={handleClick} underline="hover" style={{ cursor: "pointer" }}>
      {pointsPossible + " " + label}
    </Link>
  );
}

function Attempts({ question, handleClick }) {
  if (!question) return;

  const attemptsPossible = question.attemptsPossible;
  const label = attemptsPossible === 1 ? "attempt" : "attempts";

  if (!attemptsPossible) return null;

  return (
    <Link onClick={handleClick} underline="hover" style={{ cursor: "pointer" }}>
      {attemptsPossible + " " + label}
    </Link>
  );
}

function RightPanel({ children, questions, selQuestion }) {
  if (questions.length === 0) {
    return null;
  }

  if (questions.length > 0 && !selQuestion) {
    return (
      <Box className="right-panel">
        <Box className="flex flex-center" sx={{ minHeight: "300px" }}>
          Please select a question from the list.
        </Box>
      </Box>
    );
  }

  return <Box className="right-panel">{children}</Box>;
}
