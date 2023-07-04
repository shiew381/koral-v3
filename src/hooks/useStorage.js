import { useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig.js";

export function useStorage(
  file,
  setFile,
  storagePath,
  setUploadProgress,
  handleUploadSuccess
) {
  useEffect(() => {
    if (!file) return;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Get upload progress
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      // Handle unsuccessful uploads
      (error) => {
        console.log("an error occurred during file upload");
        console.log(error.message);
        setFile(null);
        setUploadProgress(null);
      },
      // Handle successful uploads on complete
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          handleUploadSuccess(downloadURL);
        });
        setFile(null);
        setUploadProgress(null);
      }
    );
    //eslint-disable-next-line
  }, [file]);
}
