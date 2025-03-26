const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const randomstring = require('randomstring');
const validateUser = require('../middlewares/user.js');

const UPLOAD_DIR = path.join(__dirname, '../client/public/meta-media');

// Ensure the directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

router.post('/uploadMedia', validateUser, async (req, res) => {
  console.log('[FILEUPLOAD] /uploadMedia endpoint called.');

  try {
    if (!req.files || !req.files.file) {
      console.error('[FILEUPLOAD] No file provided.');
      return res.status(400).json({ success: false, msg: 'No file provided' });
    }

    const file = req.files.file;
    const ext = path.extname(file.name); // Get file extension
    const randomSt = randomstring.generate(); // Generate random filename
    const fileName = `${randomSt}${ext}`; // Append the extension
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Save the file to the specified directory
    file.mv(filePath, (err) => {
      if (err) {
        console.error('[FILEUPLOAD] Error saving file:', err);
        return res.status(500).json({ success: false, msg: 'Error saving file' });
      }

      const fileUrl = `/meta-media/${fileName}`; // Relative path for frontend use
      console.log('[FILEUPLOAD] File stored successfully:', fileUrl);
      res.json({ success: true, fileUrl });
    });
  } catch (error) {
    console.error('[FILEUPLOAD] Error in /uploadMedia endpoint:', error);
    res.status(500).json({ success: false, msg: 'Error processing media', error: error.toString() });
  }
});

// Serve uploaded files
router.use('/meta-media', express.static(UPLOAD_DIR));

module.exports = router;
