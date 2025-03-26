const fetch = require('node-fetch');
const { sendMetatemplet } = require('../functions/function');

function replaceVariables(obj, arr) {
    console.log("🔄 Replacing variables in the template placeholders...");
    
    // Default arr to an empty array if null or not an array
    if (!Array.isArray(arr)) {
        console.warn("⚠️ Expected an array for dynamic values, but got:", arr);
        arr = [];
    }
    
    const replacedArr = arr.map(item => {
        if (item.startsWith('{{') && item.endsWith('}}')) {
            const key = item.slice(2, -2); // Remove '{{' and '}}' to get the key
            if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== '') {
                console.log(`✅ Replacing placeholder: ${item} with value: ${obj[key]}`);
                return obj[key];
            } else {
                console.warn(`⚠️ Key not found or empty: ${key}, keeping placeholder.`);
                return item; // Keep original if value not found
            }
        } else {
            return item;
        }
    });

    console.log("🔎 Replaced array:", replacedArr);
    return replacedArr;
}


async function getMetaTempletByName(name, metaKeys) {
    console.log(`Fetching meta template with name: ${name}...`);
    
    const url = `https://graph.facebook.com/v18.0/${metaKeys?.waba_id}/message_templates?name=${name}`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${metaKeys?.access_token}`
        }
    };

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        console.log("Received meta template response:", JSON.stringify(data, null, 2));

        return data;
    } catch (error) {
        console.error("Error fetching meta template:", error);
        return { error: { message: "Failed to fetch meta template" } };
    }
}

async function sendMessage(message, metaKeys) {
    console.log("Starting message sending process...");
    
    const templetName = message?.templet_name;
    console.log(`Fetching template: ${templetName}`);

    const templet = await getMetaTempletByName(templetName, metaKeys);
    const contact = JSON.parse(message?.contact);

    if (templet.error || templet?.data?.length < 1) {
        console.error("Error fetching template:", templet.error?.message || "Template not found");
        return { success: false, msg: templet.error?.message || "Unable to fetch template from Meta" };
    }

    console.log(`Template found: ${JSON.stringify(templet?.data[0])}`);

    const exampleArr = replaceVariables(contact, JSON.parse(message?.example));

    console.log("Final message parameters:", {
        send_to: message?.send_to,
        business_phone_number_id: metaKeys?.business_phone_number_id,
        access_token: metaKeys?.access_token,
        template: templet?.data[0],
        exampleArr
    });

    try {
        const resp = await sendMetatemplet(
            message?.send_to?.replace("+", ""),
            metaKeys?.business_phone_number_id,
            metaKeys?.access_token,
            templet?.data[0],
            exampleArr
        );

        console.log("Send response:", JSON.stringify(resp, null, 2));

        if (resp.error) {
            console.error("Error sending message:", resp?.error?.error_user_title || "API Error");
            return { success: false, msg: resp?.error?.error_user_title || "Please check your API" };
        } else {
            console.log("Message sent successfully, ID:", resp?.messages[0]?.id);
            return { success: true, msgId: resp?.messages[0]?.id, msg: "sent" };
        }
    } catch (error) {
        console.error("Exception while sending message:", error);
        return { success: false, msg: "Exception occurred while sending message" };
    }
}

module.exports = { sendMessage, getMetaTempletByName };
