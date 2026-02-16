const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Ensure backup directory exists
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

let tiktokLiveConnection = null;
let uniqueRoseGifters = new Set();
let roseCount = 0;
let streakTracker = new Map();
let processedMsgIds = new Set();
let targetGoal = 100; // Default goal
let uniqueGifterList = [];
let lastConnectedUsername = null;

let connectedClients = 0;
let shutdownTimer = null;

// Helper to append to CSV backup
function appendToBackup(data) {
    const date = new Date();
    const filename = `backup_${lastConnectedUsername || 'unknown'}_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.csv`;
    const filePath = path.join(backupDir, filename);

    // Header if new file
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, 'Timestamp,Sequence,Nickname,UniqueId,GiftCount\n');
    }

    const timestamp = date.toISOString();
    const line = `${timestamp},${data.sequenceNumber},"${data.nickname}",${data.uniqueId},1\n`; // Assuming 1 rose increment for unique list entry
    // Actually, we should probably log every gift event, but for Unique List recovery, just logging new uniques is enough.
    // Let's log new uniques.
    fs.appendFile(filePath, line, (err) => {
        if (err) console.error('Backup write error:', err);
    });
}

io.on('connection', (socket) => {
    connectedClients++;
    console.log(`Client connected. Total: ${connectedClients}`);

    // Cancel shutdown timer if a new client connects
    if (shutdownTimer) {
        console.log('Shutdown cancelled because a client reconnected.');
        clearTimeout(shutdownTimer);
        shutdownTimer = null;
    }

    // Manual Reset for same-user streams
    socket.on('resetSession', () => {
        console.log('Manual session reset requested.');

        // Force backup before clearing
        if (uniqueGifterList.length > 0) {
            const date = new Date();
            const filename = `MANUAL_BACKUP_${lastConnectedUsername || 'unknown'}_${date.getTime()}.csv`;
            const filePath = path.join(backupDir, filename);
            let csvContent = "Timestamp,Sequence,Nickname,UniqueId,GiftCount\n";
            uniqueGifterList.forEach(user => {
                csvContent += `${date.toISOString()},${user.sequenceNumber},"${user.nickname}",${user.uniqueId},1\n`;
            });
            fs.writeFileSync(filePath, csvContent);
        }

        uniqueRoseGifters.clear();
        roseCount = 0;
        streakTracker.clear();
        processedMsgIds.clear();
        uniqueGifterList = [];

        io.emit('roseUpdate', {
            uniqueCount: 0,
            totalCount: 0,
            uniqueGifterList: [],
            targetGoal: targetGoal,
            lastGifter: { nickname: '', repeatCount: 0, profilePictureUrl: '' } // Dummy
        });
        io.emit('connectionStatus', { status: 'disconnected' }); // Optional, or keep connected? Let's just update stats.
        // Actually, better to stay connected but zeroed out.
        // Let's re-emit targetUpdated to clear list on client
        io.emit('targetUpdated', { targetGoal, uniqueGifterList: [] });
    });

    // Send current state to newly connected client
    socket.emit('currentState', {
        uniqueCount: uniqueRoseGifters.size,
        totalCount: roseCount,
        uniqueGifterList: uniqueGifterList,
        targetGoal: targetGoal
    });

    socket.on('disconnectFromLive', () => {
        if (tiktokLiveConnection) {
            console.log('Client requested disconnect from TikTok Live');
            try {
                tiktokLiveConnection.disconnect();
            } catch (e) {
                console.error('Error disconnecting:', e);
            }
            tiktokLiveConnection = null;

            // INTENTIONAL: Do NOT clear data here anymore.
            // Persist data in memory until a NEW connection triggers a reset.
            io.emit('connectionStatus', { status: 'disconnected' });
        }
    });

    socket.on('connectToLive', (tiktokUsername) => {
        // Cleanup existing
        if (tiktokLiveConnection) {
            console.log('Disconnecting existing connection to connect to new one...');
            try {
                tiktokLiveConnection.disconnect();
            } catch (e) {
                console.error('Error disconnecting existing:', e);
            }
            tiktokLiveConnection = null;
        }

        // Only clear data if connecting to a DIFFERENT user
        if (lastConnectedUsername !== tiktokUsername) {
            console.log(`New user (${tiktokUsername}) detected. Resetting counters.`);
            uniqueRoseGifters.clear();
            roseCount = 0;
            streakTracker.clear();
            processedMsgIds.clear();
            uniqueGifterList = [];
        } else {
            console.log(`Reconnecting to same user (${tiktokUsername}). Preserving data.`);
        }

        lastConnectedUsername = tiktokUsername;

        tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

        tiktokLiveConnection.connect().then(state => {
            console.info(`Connected to roomId ${state.roomId}`);
            socket.emit('connectionStatus', { status: 'connected', roomId: state.roomId });
            io.emit('targetUpdated', { targetGoal, uniqueGifterList });
        }).catch(err => {
            console.error('Failed to connect', err);
            socket.emit('connectionStatus', { status: 'error', message: err.toString() });
        });

        // Set up listeners for the NEW connection
        tiktokLiveConnection.on('gift', (data) => {
            if (data.giftName === 'Rose' || data.giftId === 5655) {
                // Deduplicate by msgId
                if (data.msgId && processedMsgIds.has(data.msgId)) return;
                if (data.msgId) {
                    processedMsgIds.add(data.msgId);
                    if (processedMsgIds.size > 10000) processedMsgIds.clear();
                }

                const streakId = `${data.userId}_${data.giftId}`;

                const currentRepeatCount = data.repeatCount;
                const previousRepeatCount = streakTracker.get(streakId) || 0;

                let increment = 0;
                if (currentRepeatCount > previousRepeatCount) {
                    increment = currentRepeatCount - previousRepeatCount;
                } else if (currentRepeatCount < previousRepeatCount) {
                    increment = currentRepeatCount;
                }

                if (increment > 0) {
                    roseCount += increment;

                    const isNewUnique = !uniqueRoseGifters.has(data.uniqueId);
                    if (isNewUnique) {
                        uniqueRoseGifters.add(data.uniqueId);
                        const sequenceNumber = uniqueGifterList.length + 1;
                        const newEntry = {
                            sequenceNumber: sequenceNumber,
                            uniqueId: data.uniqueId,
                            nickname: data.nickname,
                            profilePictureUrl: data.profilePictureUrl
                        };
                        uniqueGifterList.push(newEntry);

                        // AUTO-BACKUP
                        appendToBackup(newEntry);
                    }

                    streakTracker.set(streakId, currentRepeatCount);

                    io.emit('roseUpdate', {
                        uniqueCount: uniqueRoseGifters.size,
                        totalCount: roseCount,
                        uniqueGifterList: uniqueGifterList,
                        targetGoal: targetGoal,
                        lastGifter: {
                            uniqueId: data.uniqueId,
                            nickname: data.nickname,
                            profilePictureUrl: data.profilePictureUrl,
                            repeatCount: currentRepeatCount
                        }
                    });
                }

                if (data.repeatEnd) {
                    streakTracker.delete(streakId);
                }
            }
        });

        tiktokLiveConnection.on('disconnected', () => {
            console.log('TikTok Live disconnected event');
            io.emit('connectionStatus', { status: 'disconnected' });
        });

        tiktokLiveConnection.on('streamEnd', () => {
            console.log('Stream ended');
            io.emit('connectionStatus', { status: 'ended' });
        });
    });

    socket.on('disconnect', () => {
        connectedClients--;
        console.log(`Client disconnected. Remaining: ${connectedClients}`);

        // If no clients remain, start shutdown timer (wait 10 seconds for potential refresh)
        if (connectedClients <= 0) {
            console.log('No clients connected. Starting shutdown timer (10s)...');
            shutdownTimer = setTimeout(() => {
                if (connectedClients <= 0) {
                    console.log('Shutting down due to no active connections.');
                    process.exit(0);
                }
            }, 10000);
        }
    });
});

app.get('/shutdown', (req, res) => {
    console.log('Shutdown requested from client.');
    res.send('Server is shutting down...');

    // Shut down gracefully
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });

    // Force close if it takes too long
    setTimeout(() => {
        console.error('Forcing shutdown...');
        process.exit(1);
    }, 1000);
});

const { exec } = require('child_process');

// ... (existing code)

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
    // Auto-open browser
    const url = `http://127.0.0.1:${PORT}`;
    const command = process.platform === 'win32' ? `explorer "${url}"` : `open "${url}"`; // Explorer is more reliable for hidden process

    exec(command, (err) => {
        if (err) {
            console.error('Failed to open browser:', err);
            console.log(`Please open ${url} manually.`);
        }
    });
});
