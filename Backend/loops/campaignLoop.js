// Import necessary modules
const moment = require('moment-timezone');
const { query } = require('../database/dbpromise');
const { getUserPlayDays } = require('../functions/function');
const { sendMessage } = require('./loopFunctions');

function delayRandom(fromSeconds, toSeconds) {
    const randomSeconds = Math.random() * (toSeconds - fromSeconds) + fromSeconds;
    console.log(`Delaying for ${randomSeconds.toFixed(2)} seconds...`);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, randomSeconds * 1000);
    });
}

function hasDatePassedInTimezone(timezone, date) {
    const momentDate = moment.tz(date, timezone);
    const currentMoment = moment.tz(timezone);
    
    // Log the formatted dates for debugging
    console.log(`Timezone: ${timezone}`);
    console.log(`Scheduled date in ${timezone}: ${momentDate.format('YYYY-MM-DD HH:mm:ss')}`);
    console.log(`Current date in ${timezone}: ${currentMoment.format('YYYY-MM-DD HH:mm:ss')}`);
    
    const hasPassed = momentDate.isBefore(currentMoment);
    console.log(`Date has ${hasPassed ? "already passed" : "not yet passed"}.`);
    return hasPassed;
}

// Function to update the broadcast status in the database
async function updateBroadcastDatabase(status, broadcastId) {
    console.log(`Updating broadcast ID ${broadcastId} with status: ${status}`);
    await query('UPDATE broadcast SET status = ? WHERE broadcast_id = ?', [status, broadcastId]);
}

// Function to process a broadcast campaign
async function processBroadcast(campaign) {
    console.log(`Processing campaign ID: ${campaign?.broadcast_id}`);

    const planDays = await getUserPlayDays(campaign?.uid);
    console.log(`User ${campaign?.uid} has ${planDays} play days.`);

    if (planDays < 1) {
        console.warn("User does not have an active plan.");
        await updateBroadcastDatabase('ACTIVE PLAN NOT FOUND', campaign?.broadcast_id);
        return;
    }

    const metaKeys = await query('SELECT * FROM meta_api WHERE uid = ?', [campaign?.uid]);
    console.log(`Fetched meta API keys for user ${campaign?.uid}: ${JSON.stringify(metaKeys)}`);

    if (metaKeys.length < 1) {
        console.warn("Meta API keys not found.");
        await updateBroadcastDatabase('META API NOT FOUND', campaign?.broadcast_id);
        return;
    }

    const log = await query(
        'SELECT * FROM broadcast_log WHERE broadcast_id = ? AND delivery_status = ? LIMIT ?',
        [campaign?.broadcast_id, 'PENDING', 1]
    );

    console.log(`Found ${log.length} pending messages for broadcast ID ${campaign?.broadcast_id}.`);

    if (log.length < 1) {
        console.log("No pending messages found, marking campaign as FINISHED.");
        await updateBroadcastDatabase('FINISHED', campaign?.broadcast_id);
        return;
    }

    const message = log[0];
    console.log(`Processing message ID: ${message?.id}`);

    const getObj = await sendMessage(message, metaKeys[0]);

    console.log("Message send response:", JSON.stringify(getObj, null, 2));

    const curTime = Date.now();

    if (getObj.success) {
        console.log(`Message sent successfully. Updating broadcast_log for message ID ${message?.id}.`);
        await query(
            `UPDATE broadcast_log SET meta_msg_id = ?, delivery_status = ?, delivery_time = ? WHERE id = ?`,
            [getObj?.msgId, getObj.msg, curTime, message?.id]
        );
    } else {
        console.error("Error sending message:", getObj.msg);
        await query(
            `UPDATE broadcast_log SET delivery_status = ? WHERE id = ?`,
            [getObj.msg, message?.id]
        );
    }
}

async function processBroadcasts() {
    console.log("Fetching broadcast campaigns with status 'QUEUE'...");
    const broadcasts = await query('SELECT * FROM broadcast WHERE status = ?', ['QUEUE']);
    console.log(`Found ${broadcasts.length} campaigns in queue.`);
// Iterate over each campaign and check the scheduled time
for (const campaign of broadcasts) {
    console.log(`Campaign ID ${campaign?.broadcast_id} schedule: ${campaign.schedule}`);

    if (campaign.schedule && hasDatePassedInTimezone(campaign?.timezone, campaign?.schedule)) {
        console.log(`Scheduled time has passed. Processing campaign ID ${campaign?.broadcast_id}.`);
        await processBroadcast(campaign);
    } else {
        const scheduledMoment = moment.tz(campaign.schedule, campaign?.timezone);
        const currentMoment = moment.tz(campaign?.timezone);

        console.log(`Skipping campaign ID ${campaign?.broadcast_id}, scheduled time not reached.`);
        console.log(`Scheduled Time (UTC): ${campaign.schedule}`);
        console.log(`Scheduled Time (${campaign?.timezone}): ${scheduledMoment.format('YYYY-MM-DD HH:mm:ss')}`);
        console.log(`Current Time (${campaign?.timezone}): ${currentMoment.format('YYYY-MM-DD HH:mm:ss')}`);
    }
}

}


// Function to introduce a random delay before processing broadcasts
async function runCampaign() {
    console.log('Campaign processing started...');
    console.log('Current system time (using moment):', moment().format('YYYY-MM-DD HH:mm:ss'));
    await processBroadcasts();
    await delayRandom(3, 5);
    console.log('Restarting campaign processing...');
    runCampaign(); // Recursive call to continuously run the campaign
}

module.exports = { runCampaign };



// Campaign processing started...
// Current system time (using moment): 2025-03-15 15:43:02
// Fetching broadcast campaigns with status 'QUEUE'...
// Found 1 campaigns in queue.
// Campaign ID 19 schedule: Sat Mar 15 2025 15:43:00 GMT+0300 (East Africa Time)
// Timezone: Africa/Nairobi
// Scheduled date in Africa/Nairobi: 2025-03-15 15:43:00
// Current date in Africa/Nairobi: 2025-03-15 15:43:02
// Date has already passed.
// Scheduled time has passed. Processing campaign ID 19.
// Processing campaign ID: 19
// User DutSMyuYOBugqF55KRO5e2UohdMVil1L has 5 play days.
// Fetched meta API keys for user DutSMyuYOBugqF55KRO5e2UohdMVil1L: [{"id":4,"uid":"DutSMyuYOBugqF55KRO5e2UohdMVil1L","waba_id":"1767019064154444","business_account_id":"412518921953007","access_token":"EAAQR9fWEa7UBO7a7ZCZC2EdhzvUggEd4O6r1ZCoUX4VZBZAjIfXt2BRtJcwyLAGJKq17WTCRUpk7ZAuLLDwzxoTYsr7vUsxZC4nCT6UkkGDvlWAZAfMNN3yKUt5lRijIgKUj90UyhLvVVn4mQ7agfZCMohmbMM5enUFFDwbr4gLnvqjHLtpahNkqpRusJeISLO2v1nRJcQiIkCy2ArJnJpaF8auxfc40ZD","business_phone_number_id":"628917700295760","app_id":"1145647990598581","createdAt":"2025-03-01T09:20:37.000Z"}]
// Found 0 pending messages for broadcast ID 19.
// No pending messages found, marking campaign as FINISHED.
// Updating broadcast ID 19 with status: FINISHED
// Delaying for 4.25 seconds...
