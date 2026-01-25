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

export const generateFilePath = (
  fileName: string,
  folder: string = "uploads"
) => {
  const timestamp = Date.now();
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, "_");
  return `${folder}/${timestamp}_${cleanFileName}`;
};

export const convertImageToWebP = async (file: File): Promise<File> => {
  let imageFile = file;

  // Handle HEIC/HEIF files (iPhone formats)
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif");

  if (isHeic) {
    try {
      const heic2any = (await import("heic2any")).default;
      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8,
      });

      const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      imageFile = new File(
        [blob],
        file.name.replace(/\.(heic|heif)$/i, ".jpg"),
        { type: "image/jpeg" }
      );
    } catch (error) {
      console.error("HEIC conversion failed:", error);
      // Fallback to original file if conversion fails
    }
  }

  // If not an image (and not HEIC that failed conversion) or already webp, return original
  if (!imageFile.type.startsWith("image/") || imageFile.type === "image/webp") {
    return imageFile;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFile);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageFile);
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const newFile = new File(
              [blob],
              imageFile.name.replace(/\.[^/.]+$/, "") + ".webp",
              { type: "image/webp" }
            );
            resolve(newFile);
          } else {
            resolve(imageFile);
          }
        },
        "image/webp",
        0.8
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(imageFile);
    };

    img.src = url;
  });
};

/**
 * Fetches an image from a URL via proxy, optimizes it to WebP (handling HEIC),
 * and uploads it to our Firebase storage.
 */
export const processImageFromUrl = async (
  imageUrl: string,
  folder: string = "uploads"
): Promise<string> => {
  try {
    // 1. Fetch via proxy to get base64/dataURL (bypasses CORS)
    const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(imageUrl)}`);
    if (!response.ok) throw new Error("Failed to fetch image via proxy");

    const { dataUrl } = await response.json();

    // 2. Convert dataUrl back to a Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    // Extract a name from the URL or use a default
    const urlParts = imageUrl.split('/');
    const originalName = urlParts[urlParts.length - 1].split('?')[0] || "image_from_url";

    const file = new File([blob], originalName, { type: blob.type });

    // 3. Convert to WebP (handles HEIC automatically now)
    const optimizedFile = await convertImageToWebP(file);

    // 4. Upload to Firebase
    const path = generateFilePath(optimizedFile.name, folder);
    return await uploadFileToFirebase(optimizedFile, path);
  } catch (error) {
    console.error("Error processing image URL:", error);
    // Fallback: Return original URL if processing fails 
    // (browser might still fail to render if it was HEIC)
    return imageUrl;
  }
};
