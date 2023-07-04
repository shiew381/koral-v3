import { TextField, InputAdornment } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SearchIcon from "@mui/icons-material/Search";

export function AnswerChoiceField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      fullWidth
      label="answer choice"
      multiline
      onChange={onChange}
      value={value}
      variant="filled"
    />
  );
}

export function CharacterLimitField({ onChange, value }) {
  return (
    <TextField
      inputProps={{ min: 0 }}
      onChange={onChange}
      label="character limit"
      sx={{ mt: 2 }}
      type="number"
      value={value}
      variant="outlined"
    />
  );
}

export function CompletionValueField({ onChange, value, questionCount }) {
  return (
    <TextField
      autoComplete="off"
      variant="outlined"
      type="number"
      inputProps={{ min: 0, max: questionCount }}
      size="small"
      value={value}
      onChange={onChange}
    />
  );
}

export function CourseDescriptionField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      fullWidth
      label="course description"
      multiline
      onChange={onChange}
      rows={4}
      sx={{ mb: 1 }}
      value={value}
      variant="filled"
    />
  );
}

export function ConfirmPasswordField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      fullWidth
      label="confirm password"
      onChange={onChange}
      sx={{ mb: 1 }}
      type="password"
      value={value}
      variant="filled"
    />
  );
}

export function CourseTitleField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      fullWidth
      label="course title"
      onChange={onChange}
      sx={{ mb: 1 }}
      value={value}
      variant="filled"
    />
  );
}

export function DescriptionField({ onChange, value }) {
  return (
    <TextField
      fullWidth
      size="small"
      autoComplete="off"
      onChange={onChange}
      label="description"
      multiline
      rows={4}
      sx={{ mb: 1 }}
      value={value}
      variant="filled"
    />
  );
}

export function EmailField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      fullWidth
      label="email"
      onChange={onChange}
      sx={{ mb: 1 }}
      value={value}
      variant="filled"
    />
  );
}

export function FirstNameField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      label="first name"
      onChange={onChange}
      value={value}
      variant="filled"
    />
  );
}

export function LastNameField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      label="last name"
      onChange={onChange}
      value={value}
      variant="filled"
    />
  );
}

export function PasswordField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      fullWidth
      label="password"
      onChange={onChange}
      sx={{ mb: 1 }}
      type="password"
      value={value}
      variant="filled"
    />
  );
}

export function PromptField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      fullWidth
      label="prompt"
      multiline
      onChange={onChange}
      rows={4}
      sx={{ mb: 1 }}
      value={value}
      variant="filled"
    />
  );
}

export function TitleField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      fullWidth
      label="title"
      onChange={onChange}
      sx={{ mb: 1 }}
      value={value}
      variant="filled"
    />
  );
}

export function ShortAnswerTextField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      fullWidth
      label="text"
      onChange={onChange}
      value={value}
      variant="filled"
    />
  );
}

export function FreeResponseExampleField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      fullWidth
      label="example response"
      multiline
      onChange={onChange}
      rows={4}
      sx={{ my: 1 }}
      value={value}
      variant="filled"
    />
  );
}

export function PointsField({ onChange, value }) {
  return (
    <TextField
      inputProps={{ min: 0 }}
      sx={{ width: "80px" }}
      onChange={onChange}
      label="points"
      type="number"
      value={value}
      variant="outlined"
    />
  );
}

export function AttemptsField({ onChange, value }) {
  return (
    <TextField
      inputProps={{ min: 0, style: { textAlign: "center", paddingRight: 10 } }}
      sx={{ width: "80px" }}
      onChange={onChange}
      label="attempts"
      type="number"
      value={value}
      variant="outlined"
      align="center"
    />
  );
}

export function SearchField({ onChange, value }) {
  return (
    <TextField
      onChange={onChange}
      label="Search"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      size="small"
      value={value}
      variant="outlined"
    />
  );
}

export function SkillsField({ onChange, value, index }) {
  return (
    <TextField
      fullWidth
      autoComplete="off"
      onChange={onChange}
      label={`skill ${index + 1}`}
      value={value}
      variant="outlined"
      sx={{ mb: 1 }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="start">
            <CheckCircleOutlineIcon color={value ? "primary" : "disabled"} />
          </InputAdornment>
        ),
      }}
    />
  );
}

export function TagField({ onChange, value }) {
  return (
    <TextField
      fullWidth
      size="small"
      autoComplete="off"
      onChange={onChange}
      label="new tag"
      value={value}
      variant="outlined"
    />
  );
}

export function UrlField({ onChange, value }) {
  return (
    <TextField
      fullWidth
      size="small"
      autoComplete="off"
      onChange={onChange}
      label="url"
      sx={{ mb: 1 }}
      placeholder="https://www.youtube.com/embed..."
      value={value}
      variant="filled"
    />
  );
}
