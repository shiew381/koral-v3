import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

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

export function AttemptsField({ onChange, value }) {
  return (
    <TextField
      helperText="choose a number between 1 - 20"
      fullWidth
      InputProps={{
        inputProps: { min: 1, max: 20, step: 1 },
      }}
      onChange={onChange}
      sx={{ mb: 1 }}
      type="number"
      value={value}
      variant="outlined"
    />
  );
}

export function CompletionThresholdField({ onChange, value, questionCount }) {
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

export function CourseSearchField({ onChange, value, handleKeyUp }) {
  return (
    <TextField
      onChange={onChange}
      onKeyUp={handleKeyUp}
      label="Search"
      placeholder="course title or instructor name"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      value={value}
      variant="outlined"
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

export function DueDatePicker({ disabled, onChange, value }) {
  return (
    <DatePicker
      disabled={disabled}
      label="due date"
      onChange={onChange}
      sx={{ maxWidth: "200px", mb: 2, mr: 1 }}
      value={value}
    />
  );
}

export function DueTimePicker({ disabled, onChange, value }) {
  return (
    <TimePicker
      disabled={disabled}
      label="due time"
      onChange={onChange}
      sx={{ maxWidth: "200px" }}
      value={value}
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

export function MessageField({ onChange, value }) {
  return (
    <TextField
      autoComplete="off"
      fullWidth
      label="message"
      multiline
      onChange={onChange}
      rows={4}
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

export function OpenDatePicker({ disabled, onChange, value }) {
  return (
    <DatePicker
      disabled={disabled}
      label="open date"
      onChange={onChange}
      sx={{ maxWidth: "200px", mb: 2, mr: 1 }}
      value={value}
    />
  );
}

export function OpenTimePicker({ disabled, onChange, value }) {
  return (
    <TimePicker
      disabled={disabled}
      label="open time"
      onChange={onChange}
      sx={{ maxWidth: "200px" }}
      value={value}
    />
  );
}

export function PercentToleranceField({ onChange, value }) {
  return (
    <TextField
      onChange={onChange}
      label="percent tolerance"
      sx={{ width: "120px" }}
      type="number"
      value={value}
      variant="filled"
    />
  );
}

export function PointsField({ onChange, value }) {
  return (
    <TextField
      label="Points"
      helperText="choose a number between 1 - 100"
      fullWidth
      InputProps={{
        inputProps: { min: 1, max: 100, step: 1 },
      }}
      onChange={onChange}
      sx={{ mb: 1 }}
      type="number"
      value={value}
      variant="outlined"
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

export function ShortTextField({ onChange, value, disabled }) {
  return (
    <TextField
      autoComplete="off"
      fullWidth
      placeholder="type answer here"
      onChange={onChange}
      value={value}
      variant="filled"
      disabled={disabled}
    />
  );
}

export function ObjectiveField({ onChange, value, index }) {
  return (
    <TextField
      fullWidth
      autoComplete="off"
      onChange={onChange}
      label={`Objective #${index + 1}`}
      value={value}
      variant="outlined"
      sx={{ mb: 1 }}
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
