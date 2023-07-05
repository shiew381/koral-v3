import { Box, Button, Typography } from "@mui/material";
import { BtnContainer } from "./Buttons";
import AddIcon from "@mui/icons-material/Add";
import { UploadFile } from "./UploadFile";

export function BuildFirstItem({ handleOpen, item, message }) {
  return (
    <Box className="build-first-item">
      <Typography align="center" color="primary" variant="h6">
        {message}
      </Typography>
      <br />
      <BtnContainer center>
        <Button onClick={handleOpen} size="large" startIcon={<AddIcon />}>
          New {item}
        </Button>
      </BtnContainer>
    </Box>
  );
}

export function UploadFirstDocument({ addDocumentRef, file, setFile, user }) {
  return (
    <Box className="build-first-item">
      <Typography align="center" color="primary" variant="h6">
        Welcome to your documents! You can upload PDF files.
      </Typography>

      <br />
      <div className="flex flex-center">
        <UploadFile
          acceptedExtensions={["pdf"]}
          acceptedTypes={["application/pdf"]}
          addRef={addDocumentRef}
          file={file}
          label="upload PDF"
          setFile={setFile}
          storagePath={`users/${user.id}/documents/${file?.name}`}
          errorMessage="Please upload a PDF"
        />
      </div>
    </Box>
  );
}
