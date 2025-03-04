const socketIO = require('socket.io');
const { query } = require('./database/dbpromise');

let ioInstance; // Global variable to store the io instance

function initializeSocket(server) {
    console.log("Initializing Socket.IO...");
    const io = socketIO(server, {
        cors: {
            origin: process.env.FRONTENDURI,
            methods: ["GET", "POST"]
        }
    });

    // Save the io instance to the global variable
    ioInstance = io;

    // Socket.IO event handling
    io.on('connection', (socket) => {
        console.log(`🔌 A user connected | Socket ID: ${socket.id}`);

        socket.on('user_connected', async ({ userId }) => {
            console.log(`📥 Received 'user_connected' event | UserID: ${userId}`);
            if (userId) {
                console.log(`✅ User ${userId.slice(0, 5)} connected | Socket ID: ${socket.id}`);
                try {
                    console.log(`🗑️ Deleting old room entry for user ${userId}`);
                    await query(`DELETE FROM rooms WHERE uid = ?`, [userId]);

                    console.log(`📌 Inserting new room entry: { uid: ${userId}, socket_id: ${socket.id} }`);
                    await query(`INSERT INTO rooms (uid, socket_id) VALUES (?, ?)`, [userId, socket.id]);

                    console.log(`✅ Room entry updated successfully for user ${userId}`);
                } catch (error) {
                    console.error(`❌ Error executing database queries for user ${userId}:`, error);
                }
            }
        });

        socket.on('disconnect', async () => {
            console.log(`⚠️ User disconnected | Socket ID: ${socket.id}`);
            try {
                console.log(`🗑️ Deleting room entry for socket ID: ${socket.id}`);
                await query(`DELETE FROM rooms WHERE socket_id = ?`, [socket.id]);
                console.log(`✅ Room entry deleted for socket ID: ${socket.id}`);
            } catch (error) {
                console.error(`❌ Error executing database query on disconnect:`, error);
            }
        });

        socket.on("change_ticket_status", async ({ uid, status, chatId }) => {
            console.log(`📥 Received 'change_ticket_status' event | User: ${uid}, Status: ${status}, Chat ID: ${chatId}`);
            try {
                console.log(`📝 Updating chat status to '${status}' for Chat ID: ${chatId} and User: ${uid}`);
                await query(`UPDATE chats SET chat_status = ? WHERE chat_id = ? AND uid = ?`, [status, chatId, uid]);

                console.log(`🔄 Fetching updated chat list for User: ${uid}`);
                const chats = await query(`SELECT * FROM chats WHERE uid = ?`, [uid]);

                console.log(`🔍 Fetching socket ID for User: ${uid}`);
                const getId = await query(`SELECT * FROM rooms WHERE uid = ?`, [uid]);

                if (getId[0]?.socket_id) {
                    console.log(`📡 Emitting 'update_chats' event to Socket ID: ${getId[0].socket_id}`);
                    io.to(getId[0].socket_id).emit("update_chats", { chats });
                } else {
                    console.log(`⚠️ Socket ID not found for User: ${uid}`);
                }
            } catch (error) {
                console.error(`❌ Error executing database queries in 'change_ticket_status':`, error);
            }
        });
    });

    console.log("✅ Socket.IO initialized successfully.");
    return io; // Return io instance
}

// Export a function to get the io instance
function getIOInstance() {
    return ioInstance;
}

module.exports = { initializeSocket, getIOInstance };
