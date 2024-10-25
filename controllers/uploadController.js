// controllers/uploadController.js
import multer from 'multer';
import { uploadFile } from '../services/uploadService.js';

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

export const uploadFileController = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ error: 'Error uploading file' });
    }

    if (!req.file) {
      return res.status(400).send({ error: 'No file provided' });
    }

    try {
      // Add additional metadata here if needed
      const metadata = {
        userId: req.body.userId,
        description: req.body.description,
      };

      const fileData = await uploadFile(req.file, metadata);
      res.status(200).json({ message: 'File uploaded successfully', data: fileData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
