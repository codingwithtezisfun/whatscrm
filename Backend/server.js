require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fileUpload = require('express-fileupload');
const mysql = require('mysql2/promise');
const { initializeSocket } = require('./socket.js');
const { runCampaign } = require('./loops/campaignLoop.js');

const app = express();

// ✅ Security Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging

// ✅ Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(fileUpload());

// ✅ Configure CORS (Allow frontend requests)
const allowedOrigins = [
    "http://localhost:5173",
    "https://your-frontend.vercel.app",
    /^http:\/\/localhost:\d+$/ 
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(pattern => pattern.test(origin))) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed'));
        }
    },
    credentials: true
}));

// ✅ Serve Static Files (React Build)
app.use(express.static(path.join(__dirname, 'client')));

// ✅ Setup MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ✅ Test Database Connection
async function testDBConnection() {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log("✅ Database Connected Successfully!", rows);
    } catch (error) {
        console.error("❌ Database Connection Failed!", error);
        process.exit(1); // Stop app if DB is not connecting
    }
}
testDBConnection();

// ✅ Inject Database Pool into Routes
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// ✅ Routers
const userRoute = require('./routes/user');
app.use('/api/user', userRoute);

const webRoute = require('./routes/web');
app.use('/api/web', webRoute);

const adminRoute = require('./routes/admin');
app.use('/api/admin', adminRoute);

const phonebookRoute = require('./routes/phonebook');
app.use('/api/phonebook', phonebookRoute);

const chat_flowRoute = require('./routes/chatFlow');
app.use('/api/chat_flow', chat_flowRoute);

const inboxRoute = require('./routes/inbox');
app.use('/api/inbox', inboxRoute);

const templetRoute = require('./routes/templet');
app.use('/api/templet', templetRoute);

const chatbotRoute = require('./routes/chatbot');
app.use('/api/chatbot', chatbotRoute);

const broadcastRoute = require('./routes/broadcast');
app.use('/api/broadcast', broadcastRoute);

const apiRoute = require('./routes/apiv2');
app.use('/api/v1', apiRoute);

const agentRoute = require('./routes/agent');
app.use('/api/agent', agentRoute);

// ✅ Serve React App for all unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// ✅ Start Server
const PORT = process.env.PORT || 3010;
const server = app.listen(PORT, () => {
    console.log(`🚀 WaCrm server is running on port ${PORT}`);

    // Run campaign after 1 second
    setTimeout(() => {
        runCampaign();
    }, 1000);
});

// ✅ Initialize Socket.IO
const io = initializeSocket(server);
module.exports = { io, pool };
