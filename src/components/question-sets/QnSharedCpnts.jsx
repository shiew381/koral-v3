import { Alert, Typography } from "@mui/material";
import parse from "html-react-parser";

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

export function CorrectIndicator({ lastSubmission }) {
  const answeredCorrectly = lastSubmission?.answeredCorrectly;
  if (!lastSubmission) {
    return <div style={{ height: "10px" }}></div>;
  }

  if (!answeredCorrectly) {
    return (
      <Alert icon={false} severity="error">
        Try again...
      </Alert>
    );
  }

  if (answeredCorrectly) {
    return <Alert severity="success">Nicely Done</Alert>;
  }
}
