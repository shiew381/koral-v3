import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { getSubmissions } from "../utils/questionSetUtils";
import { fetchUserQSet } from "../utils/firestoreClient";
import { useAuth } from "../contexts/AuthContext";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Page, PageHeader, LoadingIndicator } from "../components/common/Pages";
import AddIcon from "@mui/icons-material/Add";
import { QuestionBuilder } from "../components/forms/QnBuilder";

export default function QuestionSetPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState("build");
  const [edit, setEdit] = useState(false);

  const [qSet, setQSet] = useState(null);
  const [selQuestion, setSelQuestion] = useState(null);
  const questions = qSet?.questions || [];

  const [openBuilder, setOpenBuilder] = useState(false);

  const pathArr = location.pathname.split("/");
  const qSetID = pathArr.pop();

  function handleCloseBuilder() {
    setOpenBuilder(false);
    setEdit(false);
  }

  function handleAddQuestion() {
    setOpenBuilder(true);
    setEdit(false);
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
        </PreviewContainer>
      </Box>

      <pre>{JSON.stringify(qSet, null, 2)}</pre>
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
  const btnColor = selected ? "rgba(253,136,53,0.1)" : "transparent";

  const submissions = getSubmissions(qSet, question) || [];
  const lastSubmission = submissions?.at(-1) || null;
  const pointsAwarded = lastSubmission?.pointsAwarded || 0;

  const pointsPossible =
    question.pointsPossible > 1
      ? `${question.pointsPossible} points`
      : `${question.pointsPossible} point`;

  return (
    <ListItemButton onClick={handleClick} sx={{ bgcolor: btnColor }}>
      {/* <ListItemText primary={`Question ${index + 1}`} secondary={points} /> */}
      <ListItemText
        primary={`Question ${index + 1}`}
        secondary={`${pointsAwarded} of ${pointsPossible}`}
      />
    </ListItemButton>
  );
}
