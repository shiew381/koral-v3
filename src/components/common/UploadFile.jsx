import { useState } from "react";
import { Alert, Box, Button, LinearProgress, Typography } from "@mui/material";
import { useStorage } from "../../hooks/useStorage.js";
import { getFileExtension } from "../../utils/fileUtils.js";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export function UploadFile({
  acceptedTypes,
  acceptedExtensions,
  addRef,
  errorMessage,
  file,
  label,
  setFile,
  storagePath,
}) {
  const [error, setError] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  useStorage(file, setFile, storagePath, setUploadProgress, addRef);

  const handleSelectFile = (e) => {
    let selectedFile = e.target.files[0];
    const fileType = selectedFile?.type;
    const fileExtension = getFileExtension(selectedFile);

    const validFile =
      selectedFile &&
      (acceptedTypes.includes(fileType) ||
        acceptedExtensions.includes(fileExtension));

    if (validFile) {
      setFile(selectedFile);
      setError(false);
      // setErrorMessage("");
    } else {
      setFile(null);
      setError(true);
      // setErrorMessage(message);
    }
  };

  return (
    <>
      {!file && (
        <Button
          fullWidth
          component="label"
          startIcon={<CloudUploadIcon />}
          sx={{ py: 2 }}
        >
          {label}
          <input type="file" hidden onChange={handleSelectFile} />
        </Button>
      )}

      {error && <Alert severity="warning">{errorMessage}</Alert>}

      {file && uploadProgress > 0 && (
        <Box sx={{ padding: "15px" }}>
          <Typography noWrap sx={{ mb: 1 }}>
            Some really long thing even longer than that its supppper long
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}
    </>
  );
}
