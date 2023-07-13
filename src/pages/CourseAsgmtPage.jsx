import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import parse from "html-react-parser";
import { LoadingIndicator, Page } from "../components/common/Pages";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Radio,
  Stack,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import {
  fetchQSetSubmissionHistory,
  getAssignment,
  getQSet,
  saveQResponseFromCourse,
} from "../utils/firestoreClient";
import { useAuth } from "../contexts/AuthContext";
import {
  AttemptCounter,
  CorrectIndicator,
  PromptPreview,
} from "../components/question-sets/QnSharedCpnts";

import "../css/QuestionSet.css";
import { BtnContainer, SubmitBtn } from "../components/common/Buttons";
import { gradeResponse } from "../utils/grading";

export default function CourseAsgmtPage() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [asgmt, setAsgmt] = useState(null);
  const [qSet, setQSet] = useState(null);
  const [selQuestion, setSelQuestion] = useState(null);
  const { courseID, asgmtID } = useParams();

  useEffect(() => {
    getAssignment(courseID, asgmtID, setAsgmt);
  }, []);

  useEffect(
    () => {
      if (!asgmt) {
        return;
      }

      const docRef = asgmt.source?.docRef;
      const docRefArr = docRef.split("/");
      const userID = docRefArr[1];
      const qSetID = docRefArr[3];

      getQSet(userID, qSetID, setQSet, setLoading);
    },
    //eslint-disable-next-line
    [asgmt?.id]
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
      <BackToStudentDashboard />
      <QuestionSetDisplay
        asgmtID={asgmtID}
        courseID={courseID}
        qSet={qSet}
        selQuestion={selQuestion}
        setSelQuestion={setSelQuestion}
        user={user}
      />
    </Page>
  );
}

function QuestionSetDisplay({
  asgmtID,
  courseID,
  qSet,
  selQuestion,
  setSelQuestion,
  user,
}) {
  const [submissionHistory, setSubmissionHistory] = useState(null);

  useEffect(
    () => {
      if (!user) return;
      fetchQSetSubmissionHistory(courseID, asgmtID, user, setSubmissionHistory);
    },
    //eslint-disable-next-line
    [user]
  );

  return (
    <QSetContainer>
      <QuestionsList
        qSet={qSet}
        selQuestion={selQuestion}
        setSelQuestion={setSelQuestion}
        submissionHistory={submissionHistory}
      />
      {/* <pre>{JSON.stringify(submissionHistory, null, 2)}</pre> */}
      <QuestionCard
        asgmtID={asgmtID}
        courseID={courseID}
        qSet={qSet}
        question={selQuestion}
        submissionHistory={submissionHistory}
        user={user}
      />
    </QSetContainer>
  );
}

function QuestionsList({
  qSet,
  selQuestion,
  setSelQuestion,
  submissionHistory,
}) {
  const listStyle = {
    height: "500px",
    width: "250px",
    overflow: "auto",
    padding: 0,
    margin: "20px",
    minWidth: "230px",
  };

  const questions = qSet?.questions;

  if (!qSet) {
    return null;
  }

  if (questions?.length == 0) {
    return null;
  }

  return (
    <List sx={listStyle}>
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

function QSetContainer({ children }) {
  return <div className="question-set-container">{children}</div>;
}

function QuestionCard({
  asgmtID,
  courseID,
  question,
  submissionHistory,
  user,
}) {
  if (!question) {
    return (
      <div className="course-question-card-placeholder">
        <Typography color="text.secondary">
          please select a question from the list
        </Typography>
      </div>
    );
  }

  if (question) {
    const { type } = question;

    return (
      <Card
        className="course-question-card"
        sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }}
      >
        {type === "multiple choice" && (
          <MultipleChoice
            asgmtID={asgmtID}
            courseID={courseID}
            question={question}
            submissionHistory={submissionHistory}
            user={user}
          />
        )}
      </Card>
    );
  }
}

function MultipleChoice({
  asgmtID,
  courseID,
  question,
  submissionHistory,
  user,
}) {
  const answerChoices = question?.answerChoices || [];
  const numCorrect = answerChoices.filter((el) => el.isCorrect).length || 0;
  const submissions = submissionHistory[question.id] || [];
  const lastSubmission = submissions?.at(-1) || null;
  const lastResponse = lastSubmission?.response || [];
  const attemptsExhausted = submissions?.length >= question?.attemptsPossible;
  const answeredCorrectly = lastSubmission?.answeredCorrectly;

  const [currentResponse, setCurrentResponse] = useState(lastResponse);
  const [submitting, setSubmitting] = useState(false);

  function handleCurrentResponse(ind) {
    if (numCorrect === 1) {
      const updated = [ind];
      setCurrentResponse(updated);
    }

    if (numCorrect > 1) {
      const updated = currentResponse.includes(ind)
        ? currentResponse.filter((el) => el !== ind)
        : [...currentResponse, ind];
      setCurrentResponse(updated.sort());
    }
  }

  function detectChange() {
    if (currentResponse.length > 0 && !lastSubmission) {
      return true;
    }

    if (
      currentResponse.length > 0 &&
      currentResponse.length !== lastResponse.length
    ) {
      return true;
    }

    if (currentResponse.some((el) => !lastResponse.includes(el))) {
      return true;
    }

    return false;
  }

  function handleSubmit() {
    const grade = gradeResponse(question, currentResponse);

    saveQResponseFromCourse(
      currentResponse,
      grade,
      submissions,
      courseID,
      asgmtID,
      question,
      user,
      setSubmitting
    );
  }

  const responseChanged = detectChange();
  const disabled = !responseChanged || submitting;

  useEffect(
    () => setCurrentResponse(lastResponse),
    //eslint-disable-next-line
    [question.id]
  );

  return (
    <CardContent>
      <PromptPreview question={question} />
      <Divider sx={{ my: 1 }} />
      <CorrectIndicator
        lastSubmission={lastSubmission}
        responseChanged={responseChanged}
        submitting={submitting}
      />
      <div className="answer-choice-area">
        {answerChoices.map((el, ind) => (
          <Box className="answer-choice-row" key={`choice-${ind}`}>
            {numCorrect <= 1 && (
              <Radio
                checked={currentResponse.includes(ind) || false}
                onChange={() => handleCurrentResponse(ind)}
                disabled={attemptsExhausted || answeredCorrectly}
              />
            )}
            {numCorrect > 1 && (
              <Checkbox
                checked={currentResponse.includes(ind) || false}
                onChange={() => handleCurrentResponse(ind)}
                disabled={attemptsExhausted || answeredCorrectly}
              />
            )}
            {parse(el.text)}
          </Box>
        ))}
      </div>
      <BtnContainer right>
        <Stack>
          <Box sx={{ mb: 1 }}>
            <AttemptCounter question={question} submissions={submissions} />
          </Box>

          {!answeredCorrectly && (
            <SubmitBtn
              label="SUBMIT"
              onClick={handleSubmit}
              submitting={submitting}
              disabled={disabled}
            />
          )}
        </Stack>
      </BtnContainer>
    </CardContent>
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
  }

  return question.pointsPossible > 1
    ? `${question.pointsPossible} points`
    : `${question.pointsPossible} point`;
}
