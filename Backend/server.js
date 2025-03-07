require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const fileUpload = require('express-fileupload')
const { initializeSocket } = require('./socket.js');
const { runCampaign } = require('./loops/campaignLoop.js')

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.json())
app.use(fileUpload())

const allowedOrigins = [
    "https://whatscrm-api.web.app",
    "https://whatscrm-api.web.app/api",
    "https://whatscrm.dotcreative.co.ke",
    "https://whatscrm.dotcreative.co.ke/api",
    "http://localhost:5173"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin || "*");
        } else {
            callback(new Error("CORS not allowed"));
        }
    },
    credentials: true
}));

app.use((req, res, next) => {
    const origin = allowedOrigins.includes(req.headers.origin) ? req.headers.origin : "";
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204); 
    }

    next();
});

// Setup MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testDBConnection() {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log("Database Connected Successfully!", rows);
    } catch (error) {
        console.error("Database Connection Failed!", error);
        process.exit(1);
    }
}
testDBConnection();

app.use((req, res, next) => {
    req.db = pool;
    next();
});


// routers 
const userRoute = require('./routes/user')
app.use('/api/user', userRoute)

const webRoute = require('./routes/web')
app.use('/api/web', webRoute)

const adminRoute = require('./routes/admin')
app.use('/api/admin', adminRoute)

const phonebookRoute = require('./routes/phonebook')
app.use('/api/phonebook', phonebookRoute)

const chat_flowRoute = require('./routes/chatFlow')
app.use('/api/chat_flow', chat_flowRoute)

const inboxRoute = require('./routes/inbox')
app.use('/api/inbox', inboxRoute)

const templetRoute = require('./routes/templet')
app.use('/api/templet', templetRoute)

const chatbotRoute = require('./routes/chatbot')
app.use('/api/chatbot', chatbotRoute)

const broadcastRoute = require('./routes/broadcast')
app.use('/api/broadcast', broadcastRoute)

const apiRoute = require('./routes/apiv2')
app.use('/api/v1', apiRoute)

const agentRoute = require('./routes/agent')
app.use('/api/agent', agentRoute)

const path = require("path");

const currentDir = process.cwd();

app.use(express.static(path.resolve(currentDir, "./client/public")));

app.get("*", function (request, response) {
    response.sendFile(path.resolve(currentDir, "./client/public", "index.html"));
});

const server = app.listen(process.env.PORT || 3010, () => {
    console.log(`WaCrm server is running on port ${process.env.PORT}`);
    setTimeout(() => {
        runCampaign()
    }, 1000);
});

// Initialize Socket.IO and export it
const io = initializeSocket(server);

module.exports = io;
