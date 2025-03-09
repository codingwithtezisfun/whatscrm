const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const { query } = require('../database/dbpromise'); 
const validateUser = require('../middlewares/user.js');

async function fetchMetaDetails(uid) {
  console.log('[FILEUPLOAD] Fetching meta details for uid:', uid);
  const getMeta = await query(`SELECT * FROM meta_api WHERE uid = ?`, [uid]);
  if (getMeta.length < 1) {
    throw new Error('Unable to find API details for this user');
  }
  const waToken = getMeta[0]?.access_token;
  const waNumId = getMeta[0]?.business_phone_number_id;
  if (!waToken || !waNumId) {
    throw new Error('Please add your meta token and phone number ID');
  }
  console.log('[FILEUPLOAD] Retrieved meta details:', { waToken, waNumId });
  return { waToken, waNumId };
}

async function uploadMediaToWhatsApp(waToken, waNumId, file, mimeType) {
  const url = `https://graph.facebook.com/v22.0/${waNumId}/media`;
  console.log('[FILEUPLOAD] Uploading media to WhatsApp at URL:', url);
  
  const formData = new FormData();
  formData.append('messaging_product', 'whatsapp');
  formData.append('file', file.data, {
    filename: file.name,
    contentType: file.mimetype
  });
  formData.append('type', mimeType);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Authorization': `Bearer ${waToken}`,
        ...formData.getHeaders()
      }
    });
    console.log('[FILEUPLOAD] WhatsApp upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[FILEUPLOAD] Error uploading media to WhatsApp:',
      error.response ? error.response.data : error);
    throw error;
  }
}

router.post('/uploadMedia', validateUser, async (req, res) => {
  console.log('[FILEUPLOAD] /uploadMedia endpoint called.');
  try {
    if (!req.files || !req.files.file) {
      console.error('[FILEUPLOAD] No file provided.');
      return res.status(400).json({ success: false, msg: 'No file provided' });
    }
    
    const file = req.files.file;
    console.log('[FILEUPLOAD] Received file:', file.name, file.mimetype);

    const uid = req.decode && req.decode.uid;
    if (!uid) {
      console.error('[FILEUPLOAD] Unauthorized: No uid in req.decode.');
      return res.status(401).json({ success: false, msg: 'Unauthorized' });
    }
    
    const { waToken, waNumId } = await fetchMetaDetails(uid);
    console.log('[FILEUPLOAD] Fetched meta details for uid:', uid);

    const result = await uploadMediaToWhatsApp(waToken, waNumId, file, file.mimetype);
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[FILEUPLOAD] Error in /uploadMedia endpoint:', error);
    res.status(500).json({ success: false, msg: 'Error uploading media to WhatsApp', error: error.toString() });
  }
});

router.get('/meta-media/:mediaId', validateUser, async (req, res) => {
  console.log('[FILEUPLOAD] /meta-media endpoint called for mediaId:', req.params.mediaId);
  try {
    const mediaId = req.params.mediaId;
    const uid = req.decode && req.decode.uid;
    if (!uid) {
      console.error('[FILEUPLOAD] Unauthorized: No uid in req.decode.');
      return res.status(401).json({ success: false, msg: 'Unauthorized' });
    }
    
    const { waToken } = await fetchMetaDetails(uid);
    
    // Get the temporary URL from the WhatsApp Graph API.
    const graphUrl = `https://graph.facebook.com/v22.0/${mediaId}?access_token=${waToken}`;
    console.log('[FILEUPLOAD] Fetching media metadata from Graph API URL:', graphUrl);
    const metaResponse = await axios.get(graphUrl);
    console.log('[FILEUPLOAD] Media metadata response:', metaResponse.data);
    
    if (!metaResponse.data.url) {
      return res.status(500).json({ success: false, msg: 'No URL returned from WhatsApp.' });
    }
    
    const tempUrl = metaResponse.data.url;
    console.log('[FILEUPLOAD] Temporary media URL obtained:', tempUrl);

    const mediaResponse = await axios.get(tempUrl, { responseType: 'stream' });
    
    const contentType = mediaResponse.headers['content-type'] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    
    mediaResponse.data.pipe(res);
    
  } catch (error) {
    console.error('[FILEUPLOAD] Error in /meta-media endpoint:', error);
    res.status(500).json({ success: false, msg: 'Error fetching media from WhatsApp', error: error.toString() });
  }
});


module.exports = router;
