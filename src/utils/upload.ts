import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseStorage } from "@/config/firebase";

export const uploadFileToFirebase = async (
  file: File,
  path: string
): Promise<string> => {
  try {
    const storageRef = ref(firebaseStorage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const generateFilePath = (fileName: string, folder: string = "uploads") => {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, "_");
  return `${folder}/${timestamp}_${cleanFileName}`;
};

