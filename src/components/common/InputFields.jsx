import { TextField, InputAdornment } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SearchIcon from "@mui/icons-material/Search";

export const CourseTitleField = ({ onChange, value }) => (
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

export const CourseDescriptionField = ({ onChange, value }) => (
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

export const EmailField = ({ onChange, value }) => (
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

export const ConfirmPasswordField = ({ onChange, value }) => (
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

export const FirstNameField = ({ onChange, value }) => (
  <TextField
    autoComplete="off"
    label="first name"
    onChange={onChange}
    value={value}
    variant="filled"
  />
);

export const LastNameField = ({ onChange, value }) => (
  <TextField
    autoComplete="off"
    label="last name"
    onChange={onChange}
    value={value}
    variant="filled"
  />
);

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

export const TitleField = ({ onChange, value }) => (
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

export const PromptField = ({ onChange, value }) => (
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

export const AnswerChoiceField = ({ onChange, value }) => (
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

export const ShortAnswerTextField = ({ onChange, value }) => (
  <TextField
    autoComplete="off"
    fullWidth
    label="text"
    onChange={onChange}
    value={value}
    variant="filled"
  />
);

export const FreeResponseExampleField = ({ onChange, value }) => (
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

export const CharacterLimitField = ({ onChange, value }) => (
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

export const PointsField = ({ onChange, value }) => (
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

export const AttemptsField = ({ onChange, value }) => (
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

export const DescriptionField = ({ onChange, value }) => (
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

export const UrlField = ({ onChange, value }) => (
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

export const TagField = ({ onChange, value }) => (
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

export const SearchField = ({ onChange, value }) => (
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
    sx={{ width: "82%", mb: "8px" }}
    value={value}
    variant="outlined"
  />
);

export const SkillField = ({ onChange, value, index }) => (
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

export const CompletionValueField = ({ onChange, value, questionCount }) => (
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
