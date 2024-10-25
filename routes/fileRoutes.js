import express from 'express';
import { bucket, db } from '../config/firebaseConfig.js';

const router = express.Router();

// Route to generate a signed URL for a file in Firebase Storage
router.get('/file/:id', async (req, res) => {
  const fileId = req.params.id;

  try {
    // Retrieve file metadata from Firestore using the file ID
    const fileDoc = await db.collection('files').doc(fileId).get();

    if (!fileDoc.exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileData = fileDoc.data();
    const filename = fileData.fileName; // Get the unique filename stored in Firestore

    // Create a reference to the file in Firebase Storage
    const file = bucket.file(filename);

    // Generate a signed URL that expires in 1 hour
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour expiration
    });

    res.status(200).json({ url: signedUrl });
  } catch (error) {
    res.status(500).json({ error: 'Error generating signed URL', details: error.message });
  }
});

export default router;
