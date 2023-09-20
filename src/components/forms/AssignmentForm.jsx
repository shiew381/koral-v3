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
import {
  addAssignment,
  getUserQSets,
  updateAssignment,
} from "../../utils/firestoreClient";
import { getInitDueDate } from "../../utils/dateUtils";

function getTitle(type, selItem) {
  if (type === "question set") {
    return selItem?.title;
  } else {
    return "";
  }
}

export function AssignmentForm({
  course,
  edit,
  handleClose,
  open,
  selAsgmt,
  user,
}) {
  const initVal = edit
    ? {
        hasDateOpen: selAsgmt?.hasDateOpen,
        hasDateDue: selAsgmt?.hasDateDue,
        dateOpen: selAsgmt?.dateOpen,
        dateDue: selAsgmt?.dateDue,
        enableStudentReset: selAsgmt?.enableStudentReset || false,
      }
    : {
        hasDateOpen: false,
        hasDateDue: false,
        dateOpen: new Date(),
        dateDue: getInitDueDate(),
        enableStudentReset: false,
      };

  const add = !edit;
  const [type, setType] = useState("question set");
  const [selItem, setSelItem] = useState(null);
  const [dateDue, setDateDue] = useState(initVal.dateDue);
  const [dateOpen, setDateOpen] = useState(initVal.dateOpen);
  const [hasDateOpen, setHasDateOpen] = useState(initVal.hasDateOpen);
  const [hasDateDue, setHasDateDue] = useState(initVal.hasDateDue);
  const [enableStudentReset, setEnableStudentReset] = useState(
    initVal.enableStudentReset
  );
  const [submitting, setSubmitting] = useState(false);

  const values = {
    type: type,
    title: edit ? selAsgmt.title : getTitle(type, selItem),
    totalPointsPossible: edit
      ? selAsgmt.totalPointsPossible
      : selItem?.totalPointsPossible,
    source: edit
      ? selAsgmt.source
      : {
          type: "user content",
          docRef: `users/${user?.uid}/question-sets/${selItem?.id}`,
        },
    hasDateDue: hasDateDue,
    hasDateOpen: hasDateOpen,
    dateDue: dateDue,
    dateOpen: dateOpen,
    enableStudentReset: enableStudentReset,
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
    if (add) {
      addAssignment(course, values, handleClose, setSubmitting);
    }

    if (edit) {
      updateAssignment(course, selAsgmt, values, handleClose, setSubmitting);
    }
  }

  function handleType(e) {
    setType(e.target.value);
  }

  function resetForm() {
    setType("question set");
    setSelItem(null);
    setHasDateOpen(initVal.hasDateOpen);
    setHasDateDue(initVal.hasDateDue);
    setDateOpen(initVal.dateOpen);
    setDateDue(initVal.dateDue);
    setEnableStudentReset(initVal.enableStudentReset);
  }

  function toggleEnableReset(e) {
    setEnableStudentReset(e.target.checked);
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
      <LightboxHeader title={add ? "Add Assignment" : "Edit Assignment"} />
      <FormBody>
        <FormControl>
          <InputLabel>type</InputLabel>
          <Select
            disabled={edit}
            label="type"
            onChange={handleType}
            sx={{ mr: "15px", minWidth: "160px" }}
            value={type}
          >
            <MenuItem value="question set">Question Set</MenuItem>
            {/* <MenuItem value="student upload">Student Upload</MenuItem> */}
          </Select>
        </FormControl>
        {type === "question set" && (
          <QSetSelect
            edit={edit}
            selAsgmt={selAsgmt}
            selItem={selItem}
            setSelItem={setSelItem}
            user={user}
          />
        )}
        <br />
        <br />
        <Box sx={{ px: "3px" }}>
          <Typography color="primary">options</Typography>
          <FormControlLabel
            control={
              <Checkbox
                onChange={toggleEnableReset}
                checked={enableStudentReset}
              />
            }
            label="enable student reset"
          />
        </Box>
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
      </FormBody>

      <BtnContainer right>
        <SubmitBtn
          label={edit ? "SAVE" : "ADD"}
          onClick={handleSubmit}
          disabled={submitting}
          submitting={submitting}
        />
      </BtnContainer>
    </Lightbox>
  );
}

function QSetSelect({ edit, selAsgmt, selItem, setSelItem, user }) {
  const [qSets, setQSets] = useState([]);

  function handleItemSelect(e) {
    const foundQSet = qSets.find((qSet) => qSet.id === e.target.value);
    setSelItem(foundQSet);
  }

  useEffect(
    () => {
      if (!user) {
        return;
      }

      if (edit) {
        return;
      }

      getUserQSets(user, setQSets, setSelItem);
    },
    //eslint-disable-next-line
    [user, edit]
  );

  if (edit) {
    const source = selAsgmt?.source;
    const sourceArr = source?.docRef?.split("/");
    const selItemID = sourceArr.pop();

    return (
      <Select disabled sx={{ minWidth: "180px" }} value={selItemID || ""}>
        <MenuItem value={selItemID}>{selAsgmt.title}</MenuItem>
      </Select>
    );
  }

  if (qSets.length === 0) {
    return (
      <>
        <br />
        <br />
        <Typography color="text.secondary">
          You haven&apos;t build a question set yet. You can do so by visiting
          the Question Sets page.
        </Typography>
      </>
    );
  }

  return (
    <Select
      onChange={handleItemSelect}
      sx={{ minWidth: "180px" }}
      value={selItem?.id || ""}
    >
      {qSets.map((qSet) => (
        <MenuItem key={qSet.id} value={qSet.id}>
          {qSet.title}
        </MenuItem>
      ))}
    </Select>
  );
}

function FormBody({ children }) {
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
