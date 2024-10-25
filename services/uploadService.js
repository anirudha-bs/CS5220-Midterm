// services/uploadService.js
import { bucket, db } from '../config/firebaseConfig.js';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (file, metadata) => {
  try {
    const uniqueFileName = `${uuidv4()}_${file.originalname}`;
    const fileUpload = bucket.file(uniqueFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(),
        },
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => reject(error));
      blobStream.on('finish', async () => {
        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;

        // Filter out any undefined values from metadata
        const filteredMetadata = Object.fromEntries(
          Object.entries(metadata).filter(([_, value]) => value !== undefined)
        );

        // Save file metadata to Firestore after successful upload
        const docRef = await db.collection('files').add({
          fileName: uniqueFileName,
          url: fileUrl,
          uploadedAt: new Date(),
          ...filteredMetadata,  // Add filtered metadata here
        });

        resolve({ id: docRef.id, url: fileUrl });
      });
      blobStream.end(file.buffer);
    });
  } catch (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }
};
