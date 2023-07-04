import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStorage } from "../hooks/useStorage";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../config/firebaseConfig.js";
import {
  addPointerToFile,
  deleteFirestoreRef,
  fetchUserImages,
} from "../utils/firestoreClient.js";
import { getFileExtension } from "../utils/fileUtils";

import { formatDate } from "../utils/dateUtils";
import {
  Box,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  Popover,
  Typography,
} from "@mui/material";
import { LoadingIndicator, Page, PageHeader } from "../components/common/Pages";
// import { UploadFirstImage } from "../components/common/CallsToAction";
import { ImagePreviewBox } from "../components/common/Lightbox";
import { MoreOptionsBtn } from "../components/common/Buttons";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function ImagesPage() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selImage, setSelImage] = useState(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [uploadProgress, setUploadProgress] = useState(null);

  const { user } = useAuth();

  const menuOpen = Boolean(anchorEl);

  const handleCloseMenu = () => setAnchorEl(null);
  const handlePreviewOpen = () => setPreviewOpen(true);
  const handlePreviewClose = () => setPreviewOpen(false);

  function handleSelectFile(e) {
    let selectedFile = e.target.files[0];
    const fileType = selectedFile?.type;
    const fileExtension = getFileExtension(selectedFile);
    const acceptedTypes = ["image/png", "image/jpeg"];
    const acceptedExtensions = ["PNG", "jpeg"];

    const validFile =
      selectedFile &&
      (acceptedTypes.includes(fileType) ||
        acceptedExtensions.includes(fileExtension));

    if (!validFile) {
      setError(true);
      setErrorMessage("please select an image file (PNG or JPG)");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(false);
    setErrorMessage("");
  }

  function handleUploadSuccess(url) {
    addPointerToFile(user, file, url, "images");
  }

  function deleteImage(image) {
    const storageRef = ref(storage, `users/${user.uid}/images/${image?.name}`);
    deleteObject(storageRef)
      .then(() => deleteFirestoreRef(user, "images", image.id))
      .then(() => handleCloseMenu())
      .catch((error) => console.log(error));
  }

  useEffect(
    () => {
      if (!user) return;
      fetchUserImages(user, setImages, setFetching);
    },
    //eslint-disable-next-line
    [user]
  );

  useStorage(
    file,
    setFile,
    `users/${user?.uid}/images/${file?.name}`,
    setUploadProgress,
    handleUploadSuccess
  );

  if (!user) return null;

  if (fetching)
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );

  if (images.length === 0) {
    return (
      <Page>
        <PageHeader title="Images" />
        <div className="flex flex-center" style={{ height: "50vh" }}>
          <Box className="build-first-item">
            <Typography
              align="center"
              color="primary"
              sx={{ mb: 2 }}
              variant="h6"
            >
              Welcome to your images! Choose a JPEG or PNG file to upload.
            </Typography>

            <Box sx={{ width: "80%", margin: "auto" }}>
              {file ? (
                <Box sx={{ height: "35px" }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                  />
                </Box>
              ) : (
                <Button
                  fullWidth
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ py: 2 }}
                >
                  upload image
                  <input type="file" hidden onChange={handleSelectFile} />
                </Button>
              )}
            </Box>
          </Box>
        </div>
      </Page>
    );
  }

  if (images.length > 0) {
    return (
      <Page>
        <PageHeader title="Images" />
        <Box className="flex flex-row flex-wrap" sx={{ px: 3 }}>
          {images.map((image) => (
            <Box
              key={image.id}
              className="img-container relative flex flex-center"
            >
              <img
                alt={image.alt}
                className="img-tile"
                src={image.url}
                onClick={() => {
                  handlePreviewOpen();
                  setSelImage(image);
                }}
              />
              <ImageDetails info={image} />
              <MoreOptionsBtn
                image={image}
                setAnchorEl={setAnchorEl}
                setSelImage={setSelImage}
              />
              <MoreOptionsMenu
                anchorEl={anchorEl}
                handleClose={handleCloseMenu}
                open={menuOpen}
              >
                <Option>
                  <ListItemButton>Download</ListItemButton>
                </Option>
                <Option>
                  <ListItemButton href={selImage?.url} target="_blank">
                    Open in new tab
                  </ListItemButton>
                </Option>
                <Option>
                  <ListItemButton onClick={() => deleteImage(selImage)}>
                    Delete
                  </ListItemButton>
                </Option>
              </MoreOptionsMenu>
            </Box>
          ))}
          <Box className="img-upload-container flex flex-center">
            {/* <UploadFile
              acceptedExtensions={["PNG", "jpeg"]}
              acceptedTypes={["image/png", "image/jpeg"]}
              addRef={addImageRef}
              file={file}
              label="upload image"
              setFile={setFile}
              storagePath={`users/${user.id}/images/${file?.name}`}
              errorMessage="Please upload an image file (.jpeg or .png)"
            /> */}
          </Box>
        </Box>
        <br />
        <br />
        <ImagePreviewBox
          open={previewOpen}
          onClose={handlePreviewClose}
          image={selImage}
        />
      </Page>
    );
  }
}

function ImageDetails({ info }) {
  return (
    <div className="img-details">
      <Typography sx={{ pt: 1, px: 2 }} variant="subtitle1">
        {info.name}
      </Typography>
      <Typography sx={{ px: 2, pb: 1 }} variant="subtitle2">
        uploaded {formatDate(info.uploaded)}
      </Typography>
    </div>
  );
}

function MoreOptionsMenu({ open, anchorEl, handleClose, children }) {
  const anchorPlacement = {
    vertical: "center",
    horizontal: "center",
  };

  const originPlacement = {
    vertical: "top",
    horizontal: "left",
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={anchorPlacement}
      transformOrigin={originPlacement}
    >
      <List disablePadding>{children}</List>
    </Popover>
  );
}

function Option({ children }) {
  return <ListItem disablePadding>{children}</ListItem>;
}
