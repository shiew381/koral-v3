import { Box, Fab, LinearProgress, Typography } from "@mui/material";
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
        <Fab color="primary" onClick={handleOpen} variant="extended">
          <AddIcon />
          New {item}
        </Fab>
      </BtnContainer>
    </Box>
  );
}

// export function UploadFirstImage({ addImageRef, file, setFile, user }) {
//   return (
//     <Box className="build-first-item">
//       <Typography align="center" color="primary" variant="h6">
//         Welcome to your images! You can upload JPEG or PNG files.
//       </Typography>

//       <br />
//       <div className="flex flex-center">
//         <UploadFile
//           acceptedExtensions={["PNG", "jpeg"]}
//           acceptedTypes={["image/png", "image/jpeg"]}
//           addRef={addImageRef}
//           file={file}
//           label="upload image"
//           setFile={setFile}
//           storagePath={`users/${user.id}/images/${file?.name}`}
//           errorMessage="Please upload an image file (.jpeg or .png)"
//         />
//       </div>
//     </Box>
//   );
// }

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
