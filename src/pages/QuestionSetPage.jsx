import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Button,
  Card,
  Divider,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
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
import "../css/QuestionSet.css";
import FreeResponse from "../components/question-sets/QnFreeResponse";
import {
  QSetContainer,
  QuestionCardPanel,
  QuestionNav,
  QuestionList,
} from "../components/question-sets/QSetSharedCpnts";
import { getSubmissions } from "../utils/questionSetUtils";

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

  const submissionHistory = qSet?.submissionHistory || null;

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

  if (questions.length === 0) {
    return (
      <Page>
        <BackToQSets />
        <PageHeader title={qSet?.title} />
        <pre>{JSON.stringify(openBuilder)}</pre>
        <GetStarted
          handleAddQuestion={handleAddQuestion}
          loading={loading}
          questions={questions}
        />
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
      </Page>
    );
  }

  return (
    <Page>
      <BackToQSets />
      <Box sx={{ px: 2 }}>
        <PageHeader title={qSet?.title} />
        <Divider />
        <QSetContainer>
          <Box className="question-list-container">
            <QuestionList
              questions={questions}
              selQuestion={selQuestion}
              setSelQuestion={setSelQuestion}
              submissionHistory={submissionHistory}
            />
            <Box className="add-question-container">
              <Divider sx={{ mb: 2 }} />
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
          <QuestionNav
            qIndex={qIndex}
            questions={questions}
            setSelQuestion={setSelQuestion}
          />

          <QuestionCardPanel>
            {questions.length > 0 && (
              <ToggleButtonGroup
                color="primary"
                exclusive
                onChange={handleMode}
                size="small"
                sx={{ position: "absolute", top: -35, right: 15 }}
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
          </QuestionCardPanel>
        </QSetContainer>
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

function GetStarted({ handleAddQuestion }) {
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

function QuestionCard({
  handleEditQuestion,
  handleOpenPoints,
  handleOpenAttempts,
  mode,
  qSet,
  question,
  user,
}) {
  const docRefParams = {
    qSetID: qSet.id,
    userID: user.uid,
  };

  if (!question) {
    return (
      <div className="question-card-placeholder">
        <Typography color="text.secondary">
          please select a question from the list
        </Typography>
      </div>
    );
  }

  if (question) {
    const { type } = question;
    const submissions = getSubmissions(qSet, question) || [];

    return (
      <Card className="question-card" sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
        {mode === "preview" && (
          <Box className="question-card-actions">
            <Points question={question} handleClick={handleOpenPoints} />
            <VertDivider hidden={question.type === "free response"} />
            <Attempts question={question} handleClick={handleOpenAttempts} />
            <VertDivider />
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
            docRefParams={docRefParams}
            mode={mode}
            question={question}
            submissions={submissions}
          />
        )}
        {type === "short answer" && (
          <ShortAnswer
            docRefParams={docRefParams}
            mode={mode}
            question={question}
            submissions={submissions}
          />
        )}
        {type == "free response" && (
          <FreeResponse
            docRefParams={docRefParams}
            mode={mode}
            question={question}
            qSet={qSet}
            submissions={submissions}
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
