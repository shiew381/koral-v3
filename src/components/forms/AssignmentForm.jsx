import { useState, useEffect } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { BtnContainer, SubmitBtn } from "../common/Buttons";
import { Lightbox, LightboxHeader } from "../common/Lightbox";
import {
  DueDatePicker,
  DueTimePicker,
  OpenDatePicker,
  OpenTimePicker,
} from "../common/InputFields";
import { addAssignment, getUserQSets } from "../../utils/firestoreClient";
import { getInitDueDate } from "../../utils/dateUtils";

function getTitle(type, selItem) {
  if (type === "question set") {
    return selItem?.title;
  }
}

export function AssignmentForm({ course, handleClose, open, user }) {
  const [type, setType] = useState("question set");
  const [selItem, setSelItem] = useState(null);
  const [dateDue, setDateDue] = useState(getInitDueDate());
  const [dateOpen, setDateOpen] = useState(new Date());
  const [hasDateOpen, setHasDateOpen] = useState(false);
  const [hasDateDue, setHasDateDue] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const values = {
    type: type,
    title: getTitle(type, selItem),
    source: {
      type: "user content",
      docRef: `users/${user?.uid}/question-sets/${selItem?.id}`,
    },
    hasDateDue: hasDateDue,
    hasDateOpen: hasDateOpen,
    dateDue: dateDue,
    dateOpen: dateOpen,
  };

  function handleKeyUp(e) {
    if (e.code === "Enter") {
      handleSubmit();
    }
  }

  function handleDateDue(date) {
    setDateDue(date);
  }

  function handleDateOpen(date) {
    setDateOpen(date);
  }

  function handleSubmit() {
    addAssignment(course, values, handleClose, setSubmitting);
  }

  function handleType(e) {
    setType(e.target.value);
  }

  function resetForm() {
    setDateDue(getInitDueDate());
    setDateOpen(new Date());
  }

  function toggleHasDateOpen(e) {
    setHasDateOpen(e.target.checked);
  }

  function toggleHasDateDue(e) {
    setHasDateDue(e.target.checked);
  }

  useEffect(resetForm, [open]);

  return (
    <Lightbox
      open={open}
      onClose={handleClose}
      handleKeyUp={handleKeyUp}
      customStyle={{ maxWidth: "900px" }}
    >
      <LightboxHeader title="Add Assignment" />
      <Body>
        <FormControl>
          <InputLabel>type</InputLabel>
          <Select
            label="type"
            onChange={handleType}
            sx={{ mr: "15px", minWidth: "160px" }}
            value={type}
          >
            <MenuItem value="question set">Question Set</MenuItem>
            <MenuItem value="student upload">Student Upload</MenuItem>
          </Select>
        </FormControl>
        {type === "question set" && (
          <QSetSelect selItem={selItem} setSelItem={setSelItem} user={user} />
        )}
        <br />
        <br />
        <DateSettings
          dateDue={dateDue}
          dateOpen={dateOpen}
          hasDateDue={hasDateDue}
          hasDateOpen={hasDateOpen}
          handleDateDue={handleDateDue}
          handleDateOpen={handleDateOpen}
          toggleHasDateDue={toggleHasDateDue}
          toggleHasDateOpen={toggleHasDateOpen}
        />
      </Body>

      <BtnContainer right>
        <SubmitBtn
          label="ADD"
          onClick={handleSubmit}
          disabled={submitting}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}

function QSetSelect({ selItem, setSelItem, user }) {
  const [qSets, setQSets] = useState([]);

  function handleItemSelect(e) {
    const foundQSet = qSets.find((qSet) => qSet.id === e.target.value);
    setSelItem(foundQSet);
  }

  useEffect(
    () => {
      if (!user) return;
      getUserQSets(user, setQSets, setSelItem);
    },
    //eslint-disable-next-line
    [user]
  );

  if (!selItem) {
    return null;
  }

  return (
    <Select
      value={selItem?.id || ""}
      onChange={handleItemSelect}
      sx={{ minWidth: "180px" }}
    >
      {qSets.map((qSet) => (
        <MenuItem key={qSet.id} value={qSet.id}>
          {qSet.title}
        </MenuItem>
      ))}
    </Select>
  );
}

function Body({ children }) {
  return <Box sx={{ px: 3, py: 1 }}>{children}</Box>;
}

function DateSettings({
  dateDue,
  dateOpen,
  handleDateDue,
  handleDateOpen,
  hasDateDue,
  hasDateOpen,
  toggleHasDateDue,
  toggleHasDateOpen,
}) {
  return (
    <table>
      <thead>
        <tr>
          <td>
            <Typography color="primary">open / due date settings</Typography>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <FormControlLabel
              control={
                <Checkbox onChange={toggleHasDateOpen} checked={hasDateOpen} />
              }
              label="set open date"
            />
          </td>
          <td style={{ paddingLeft: "20px" }}>
            <FormControlLabel
              control={
                <Checkbox onChange={toggleHasDateDue} checked={hasDateDue} />
              }
              label="set due date"
            />
          </td>
        </tr>
        <tr>
          <td>
            <OpenDatePicker
              disabled={!hasDateOpen}
              onChange={handleDateOpen}
              value={dateOpen}
            />
            <OpenTimePicker
              disabled={!hasDateOpen}
              onChange={handleDateOpen}
              value={dateOpen}
            />
          </td>
          <td style={{ paddingLeft: "20px" }}>
            <DueDatePicker
              disabled={!hasDateDue}
              onChange={handleDateDue}
              value={dateDue}
            />
            <DueTimePicker
              disabled={!hasDateDue}
              onChange={handleDateDue}
              value={dateDue}
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
}
