const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

let tiktokLiveConnection = null;
let uniqueRoseGifters = new Set();
let roseCount = 0;
let streakTracker = new Map();
let processedMsgIds = new Set();
let targetGoal = 100; // Default goal
let uniqueGifterList = [];

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('setTarget', (goalNumber) => {
        const num = parseInt(goalNumber, 10);
        if (!isNaN(num)) {
            targetGoal = num;
            io.emit('targetUpdated', { targetGoal, uniqueGifterList });
        }
    });

    socket.on('disconnectFromLive', () => {
        if (tiktokLiveConnection) {
            console.log('Client requested disconnect');
            try {
                tiktokLiveConnection.disconnect();
            } catch (e) {
                console.error('Error disconnecting:', e);
            }
            tiktokLiveConnection = null;

            // Reset state global
            uniqueRoseGifters.clear();
            roseCount = 0;
            streakTracker.clear();
            processedMsgIds.clear();
            uniqueGifterList = [];

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

            uniqueRoseGifters.clear();
            roseCount = 0;
            streakTracker.clear();
            processedMsgIds.clear();
            uniqueGifterList = [];
        }

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
                        uniqueGifterList.push({
                            sequenceNumber: sequenceNumber,
                            uniqueId: data.uniqueId,
                            nickname: data.nickname,
                            profilePictureUrl: data.profilePictureUrl
                        });
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

        tiktokLiveConnection.on('chat', (data) => {
            // console.log(`${data.uniqueId}: ${data.comment}`);
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
        console.log('Client disconnected');
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

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Auto-open browser
    const url = `http://localhost:${PORT}`;
    const command = process.platform === 'win32' ? `start "" "${url}"` : `open "${url}"`; // Win32 or Mac (linux needs xdg-open)

    exec(command, (err) => {
        if (err) {
            console.error('Failed to open browser:', err);
            console.log(`Please open ${url} manually.`);
        }
    });
});
