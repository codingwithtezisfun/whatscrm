const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const { query } = require("../database/dbpromise");
const { default: axios } = require("axios");
const randomstring = require("randomstring");
const { getIOInstance } = require("../socket");
const fetch = require("node-fetch");
const mime = require("mime-types");
const nodemailer = require("nodemailer");
const unzipper = require("unzipper");
const { destributeTaskFlow } = require("./chatbot");

async function createMetaTemplet(apiVersion, waba_id, bearerToken, body) {
  const url = `https://graph.facebook.com/${apiVersion}/${waba_id}/message_templates`;
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body), // Include the request body here
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Re-throw the error to handle it upstream
  }
}

async function getAllTempletsMeta(apiVersion, waba_id, bearerToken) {
  const url = `https://graph.facebook.com/${apiVersion}/${waba_id}/message_templates`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Re-throw the error to handle it upstream
  }
}

async function delMetaTemplet(apiVersion, waba_id, bearerToken, name) {
  const url = `https://graph.facebook.com/${apiVersion}/${waba_id}/message_templates?name=${name}`;
  const options = {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Re-throw the error to handle it upstream
  }
}

async function sendMetatemplet(
  toNumber,
  business_phone_number_id,
  token,
  template,
  example,
  dynamicMedia
) {
  const checkBody = template?.components?.filter((i) => i.type === "BODY");
  const getHeader = template?.components?.filter((i) => i.type === "HEADER");
  const headerFormat = getHeader.length > 0 ? getHeader[0]?.format : "";

  console.log({ template: JSON.stringify(template) });

  let templ = {
    name: template?.name,
    language: {
      code: template?.language,
    },
    components: [],
  };

  if (checkBody.length > 0) {
    const comp = checkBody[0]?.example?.body_text[0]?.map((i, key) => ({
      type: "text",
      text: example[key] || i,
    }));
    if (comp) {
      templ.components.push({
        type: "body",
        parameters: comp,
      });
    }
  }

  if (headerFormat === "IMAGE" && getHeader.length > 0) {
    const getMedia = await query(
      `SELECT * FROM meta_templet_media WHERE templet_name = ?`,
      [template?.name]
    );

    templ.components.unshift({
      type: "header",
      parameters: [
        {
          type: "image",
          image: {
            link:
              dynamicMedia || getMedia.length > 0
                ? `${process.env.FRONTENDURI}/media/${getMedia[0]?.file_name}`
                : getHeader[0].example?.header_handle[0],
          },
        },
      ],
    });
  }

  if (headerFormat === "VIDEO" && getHeader.length > 0) {
    const getMedia = await query(
      `SELECT * FROM meta_templet_media WHERE templet_name = ?`,
      [template?.name]
    );

    templ.components.unshift({
      type: "header",
      parameters: [
        {
          type: "video",
          video: {
            link:
              dynamicMedia || getMedia.length > 0
                ? `${process.env.FRONTENDURI}/media/${getMedia[0]?.file_name}`
                : getHeader[0].example?.header_handle[0],
          },
        },
      ],
    });
  }

  if (headerFormat === "DOCUMENT" && getHeader.length > 0) {
    const getMedia = await query(
      `SELECT * FROM meta_templet_media WHERE templet_name = ?`,
      [template?.name]
    );

    templ.components.unshift({
      type: "header",
      parameters: [
        {
          type: "document",
          document: {
            link:
              dynamicMedia || getMedia.length > 0
                ? `${process.env.FRONTENDURI}/media/${getMedia[0]?.file_name}`
                : getHeader[0].example?.header_handle[0],
            filename: "document",
          },
        },
      ],
    });
  }

  const url = `https://graph.facebook.com/v22.0/${business_phone_number_id}/messages`;

  // console.log({ templ: JSON.stringify(templ) })

  const body = {
    messaging_product: "whatsapp",
    to: toNumber,
    type: "template",
    template: templ,
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    // console.log({ data: JSON.stringify(data) });
    // console.log({ body: JSON.stringify(body) });
    // console.log({ data })
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

function getFileInfo(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        const fileSizeInBytes = stats.size;
        const mimeType = mime.lookup(filePath) || "application/octet-stream";
        resolve({ fileSizeInBytes, mimeType });
      }
    });
  });
}
