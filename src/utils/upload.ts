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

export const convertImageToWebP = async (file: File): Promise<File> => {
  // If not an image or already webp, return original
  if (!file.type.startsWith("image/") || file.type === "image/webp") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const newFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + ".webp",
              { type: "image/webp" }
            );
            resolve(newFile);
          } else {
            resolve(file);
          }
        },
        "image/webp",
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
};
