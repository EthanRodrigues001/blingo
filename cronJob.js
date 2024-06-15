const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('./models/User');

// Cron job to reset tokens every 24 hours
cron.schedule('0 0 * * *', async () => {
    try {
        // Reset tokens for all users
        await User.updateMany({}, { tokens: 250, tokensLastReset: Date.now() });
        console.log('User tokens have been reset');
    } catch (error) {
        console.error('Error resetting user tokens:', error);
    }
});

// Cron job to reset tokens every minute for testing

// cron.schedule('*/1 * * * *', async () => {
//     try {
//         // Reset tokens for all users
//         await User.updateMany({}, { tokens: 250, tokensLastReset: Date.now() });
//         console.log('User tokens have been reset');
//     } catch (error) {
//         console.error('Error resetting user tokens:', error);
//     }
// });
