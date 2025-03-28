const router = require('express').Router()
const { query } = require('../database/dbpromise.js')
const randomstring = require('randomstring')
const bcrypt = require('bcryptjs')
const { isValidEmail, getFileExtension, saveJsonToFile, saveWebhookConversation, readJSONFile, sendMetaMsg, mergeArrays, botWebhook, sendMetatemplet, updateMetaTempletInMsg, getUserPlayDays, deleteFileIfExists } = require('../functions/function.js')
const { sign } = require('jsonwebtoken')
const validateUser = require('../middlewares/user.js')
const { getIOInstance } = require('../socket.js');
const { checkPlan } = require('../middlewares/plan.js')


// getting chat lists 
router.get('/get_chats', validateUser, async (req, res) => {
    try {
        let data = []
        data = await query(`SELECT * FROM chats WHERE uid = ?`, [req.decode.uid])
        const getContacts = await query(`SELECT * FROM contact WHERE uid = ?`, [req.decode.uid])


        if (data.length > 0 && getContacts.length > 0) {
            data = mergeArrays(getContacts, data)
        } else {
            data = data
        }

        res.json({ data, success: true })

    } catch (err) {
        console.log(err);
        res.json({ err, success: false, msg: "Something went wrong" });
    }
})


// get chat conversatio 
router.post('/get_convo', validateUser, async (req, res) => {
    try {
        const { chatId } = req.body

        const filePath = `${__dirname}/../conversations/inbox/${req.decode.uid}/${chatId}.json`
        const data = readJSONFile(filePath, 100)
        res.json({ data, success: true })
    } catch (err) {
        console.log(err);
        res.json({ err, success: false, msg: "Something went wrong" });
    }
})

// handle post webhook 
router.post('/webhook/:uid', async (req, res) => {
    try {
        const body = req.body
        const userUID = req.params.uid;
        console.log({ userUID, body: JSON.stringify(body) })

        res.sendStatus(200);

        console.log({
            body: JSON.stringify(body)
        })

        const getDays = await getUserPlayDays(userUID)
        if (getDays < 1) {
            return
        }
        // save message 
        await saveWebhookConversation(body, userUID)

    } catch (err) {
        console.log(err);
        res.json({ err, success: false, msg: "Something went wrong" });
    }
})


// adding webhook 
router.get('/webhook/:uid', async (req, res) => {
    try {
        const { uid } = req.params

        const queryParan = req.query
        const body = req.body

        console.log({ query: JSON.stringify(queryParan) })
        console.log({ body: JSON.stringify(body) })

        const getUser = await query(`SELECT * FROM user WHERE uid = ?`, [uid])

        let verify_token = ""

        if (getUser.length < 1) {
            verify_token = "NULL"
            res.json({ success: false, msg: "Token not verified", webhook: uid, token: "NOT FOUND" })
        } else {
            verify_token = uid

            let mode = req.query["hub.mode"];
            let token = req.query["hub.verify_token"];
            let challenge = req.query["hub.challenge"];

            // Check if a token and mode were sent
            if (mode && token) {
                // Check the mode and token sent are correct
                if (mode === "subscribe" && token === verify_token) {
                    // Respond with 200 OK and challenge token from the request
                    console.log("WEBHOOK_VERIFIED");
                    res.status(200).send(challenge);
                } else {
                    // Responds with '403 Forbidden' if verify tokens do not match
                    res.sendStatus(403);
                }
            } else {
                res.json({ success: false, msg: "Token not verified", webhook: uid, token: "FOUND" })
            }
        }
    } catch (err) {
        console.log(err);
        res.json({ err, success: false, msg: "Something went wrong" });
    }
})


router.get('/', async (req, res) => {
    try {
        const uid = "lWvj6K0xI0FlSKJoyV7ak9DN0mzvKJK8"
        const { msg } = req.query

        // getting socket id 
        const sock = await query(`SELECT * FROM rooms WHERE uid = ?`, [uid])


        const io = getIOInstance();

        console.log(sock[0]?.socket_id)

        io.to(sock[0]?.socket_id).emit('update_conversations', "msg");

        res.json(msg);
    } catch (err) {
        console.log(err);
        res.json({ err, success: false, msg: "Something went wrong" });
    }
});

// sending templets 
router.post('/send_templet', validateUser, checkPlan, async (req, res) => {
    try {
        const { content, toName, toNumber, chatId, msgType } = req.body

        if (!content || !toName || !toName || !msgType) {
            return res.json({ success: false, msg: "Invalid request" })
        }

        const msgObj = content

        const savObj = {
            "type": msgType,
            "metaChatId": "",
            "msgContext": content,
            "reaction": "",
            "timestamp": "",
            "senderName": toName,
            "senderMobile": toNumber,
            "status": "sent",
            "star": false,
            "route": "OUTGOING"
        }

        const resp = await sendMetaMsg(req.decode.uid, msgObj, toNumber, savObj, chatId)
        res.json(resp)

    } catch (err) {
        console.log(err);
        res.json({ err, success: false, msg: "Something went wrong" });
    }
})


/router.post('/send_image', validateUser, checkPlan, async (req, res) => {
    try {
      // Now accept mediaUrl in addition to url and mediaId
      const { mediaUrl, url, mediaId, toNumber, toName, chatId, caption } = req.body;
      if ((!mediaUrl && !url && !mediaId) || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
  
      // Build the message object: priority to mediaUrl, then mediaId, then url.
      const msgObj = {
        type: "image",
        image: mediaUrl 
          ? { link: mediaUrl, caption: caption || "" } 
          : mediaId 
            ? { id: mediaId, caption: caption || "" }
            : { link: url, caption: caption || "" }
      };
  
      const savObj = {
        type: "image",
        metaChatId: "",
        msgContext: msgObj, // Save same payload for consistency
        reaction: "",
        timestamp: "",
        senderName: toName,
        senderMobile: toNumber,
        status: "sent",
        star: false,
        route: "OUTGOING"
      };
  
      const resp = await sendMetaMsg(req.decode.uid, msgObj, toNumber, savObj, chatId);
      res.json(resp);
    } catch (err) { 
      console.log(err);
      res.json({ err, success: false, msg: "Something went wrong" });
    }
  });
  
  router.post('/send_video', validateUser, checkPlan, async (req, res) => {
    try {
      const { mediaUrl, url, mediaId, toNumber, toName, chatId, caption } = req.body;
      if ((!mediaUrl && !url && !mediaId) || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
    
      const msgObj = {
        type: "video",
        video: mediaUrl 
          ? { link: mediaUrl, caption: caption || "" } 
          : mediaId 
            ? { id: mediaId, caption: caption || "" }
            : { link: url, caption: caption || "" }
      };
    
      const savObj = {
        type: "video",
        metaChatId: "",
        msgContext: msgObj,
        reaction: "",
        timestamp: "",
        senderName: toName,
        senderMobile: toNumber,
        status: "sent",
        star: false,
        route: "OUTGOING"
      };
    
      const resp = await sendMetaMsg(req.decode.uid, msgObj, toNumber, savObj, chatId);
      res.json(resp);
    } catch (err) {
      console.log(err);
      res.json({ err, success: false, msg: "Something went wrong" });
    }
  });
  
  router.post('/send_doc', validateUser, checkPlan, async (req, res) => {
    try {
      const { mediaUrl, url, mediaId, toNumber, toName, chatId, caption } = req.body;
      if ((!mediaUrl && !url && !mediaId) || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
    
      const msgObj = {
        type: "document",
        document: mediaUrl 
          ? { link: mediaUrl, caption: caption || "" } 
          : mediaId 
            ? { id: mediaId, caption: caption || "" }
            : { link: url, caption: caption || "" }
      };
    
      const savObj = {
        type: "document",
        metaChatId: "",
        msgContext: msgObj,
        reaction: "",
        timestamp: "",
        senderName: toName,
        senderMobile: toNumber,
        status: "sent",
        star: false,
        route: "OUTGOING"
      };
    
      const resp = await sendMetaMsg(req.decode.uid, msgObj, toNumber, savObj, chatId);
      res.json(resp);
    } catch (err) {
      console.log(err);
      res.json({ err, success: false, msg: "Something went wrong" });
    }
  });

  
  router.post('/send_audio', validateUser, checkPlan, async (req, res) => {
    try {
      const { mediaUrl, url, mediaId, toNumber, toName, chatId } = req.body;
      if ((!mediaUrl && !url && !mediaId) || !toNumber || !toName || !chatId) {
        return res.json({ success: false, msg: "Not enough input provided" });
      }
    
      const msgObj = {
        type: "audio",
        audio: mediaUrl 
          ? { link: mediaUrl } 
          : mediaId 
            ? { id: mediaId }
            : { link: url }
      };
    
      const savObj = {
        type: "audio",
        metaChatId: "",
        msgContext: msgObj,
        reaction: "",
        timestamp: "",
        senderName: toName,
        senderMobile: toNumber,
        status: "sent",
        star: false,
        route: "OUTGOING"
      };
    
      const resp = await sendMetaMsg(req.decode.uid, msgObj, toNumber, savObj, chatId);
      res.json(resp);
    } catch (err) {
      console.log(err);
      res.json({ err, success: false, msg: "Something went wrong" });
    }
  });
  
  

// send text message 
router.post('/send_text', validateUser, checkPlan, async (req, res) => {
    try {
        const { text, toNumber, toName, chatId } = req.body


        if (!text || !toNumber || !toName || !chatId) {
            return res.json({ success: false, msg: "Not enough input provided" })
        }

        const msgObj = {
            "type": "text",
            "text": {
                "preview_url": true,
                "body": text
            }
        }
        const savObj = {
            "type": "text",
            "metaChatId": "",
            "msgContext": {
                "type": "text",
                "text": {
                    "preview_url": true,
                    "body": text
                }
            },
            "reaction": "",
            "timestamp": "",
            "senderName": toName,
            "senderMobile": toNumber,
            "status": "sent",
            "star": false,
            "route": "OUTGOING"
        }
        const resp = await sendMetaMsg(req.decode.uid, msgObj, toNumber, savObj, chatId)
        res.json(resp)
    } catch (err) {
        console.log(err);
        res.json({ err, success: false, msg: "Something went wrong" });
    }
})

// send meta templet 
router.post('/send_meta_templet', validateUser, checkPlan, async (req, res) => {
    try {
        const { template, toNumber, toName, chatId, example } = req.body

        if (!template) {
            return res.json({ success: false, msg: "Please type input" })
        }

        const getMETA = await query(`SELECT * FROM meta_api WHERE uid = ?`, [req.decode.uid])
        if (getMETA.length < 1) {
            return res.json({ success: false, msg: "Please check your meta API keys [1]" })
        }

        const resp = await sendMetatemplet(toNumber, getMETA[0]?.business_phone_number_id, getMETA[0]?.access_token, template, example)

        if (resp.error) {
            console.log(resp)
            return res.json({ success: false, msg: resp?.error?.error_user_title || "Please check your API" })
        } else {

            const savObj = {
                "type": "text",
                "metaChatId": "",
                "msgContext": {
                    "type": "text",
                    "text": {
                        "preview_url": true,
                        "body": `{{TEMPLET_MESSAGE}} | ${template?.name}`
                    }
                },
                "reaction": "",
                "timestamp": "",
                "senderName": toName,
                "senderMobile": toNumber,
                "status": "sent",
                "star": false,
                "route": "OUTGOING"
            }

            await updateMetaTempletInMsg(req.decode.uid, savObj, chatId, resp?.messages[0]?.id)
            res.json({ success: true, msg: "The templet message was sent" })
        }

    } catch (err) {
        console.log(err);
        res.json({ err, success: false, msg: "Something went wrong" });
    }
})


// del chat 
router.post("/del_chat", validateUser, async (req, res) => {
    try {
        const { chatId } = req.body
        await query(`DELETE FROM chats WHERE chat_id = ? AND uid = ?`, [chatId, req.decode.uid])
        const filePath = `${__dirname}/../conversations/inbox/${req.decode.uid}/${chatId}`

        deleteFileIfExists(filePath)

        res.json({ success: true, msg: "Conversation has been deleted" })

    } catch (err) {
        console.log(err);
        res.json({ err, success: false, msg: "Something went wrong" });
    }
})

router.post('/update_chat_status', validateUser, async (req, res) => {
    try {
      const { chatId, status } = req.body;
      await query(
        `UPDATE chats SET chat_status = ? WHERE chat_id = ? AND uid = ?`,
        [status, chatId, req.decode.uid]
      );
      res.json({ success: true, msg: "Chat status updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Failed to update chat status", err });
    }
  });

  router.get('/get_chat_status/:chatId', validateUser, async (req, res) => {
    try {
        const { chatId } = req.params;
        const result = await query(
            `SELECT chat_status FROM chats WHERE chat_id = ? AND uid = ?`,
            [chatId, req.decode.uid]
        );
        
        if (result.length > 0) {
            res.json({ success: true, status: result[0].chat_status });
        } else {
            res.json({ success: false, msg: "Chat not found" });
        }
    } catch (err) {
        console.error("Error fetching chat status:", err);
        res.json({ success: false, msg: "Failed to fetch chat status", err });
    }
});

module.exports = router;