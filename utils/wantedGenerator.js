const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function createWantedImage(imageURL) {
    try {
        const canvas = createCanvas(736, 959);
        const ctx = canvas.getContext('2d');

        // Load background image from local file in the 'img' folder
        const background = await loadImage(path.join(__dirname, '..', 'img', 'wanted.jpg'));
        if (!background) throw new Error('Failed to load background image.');
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Load user-provided image
        const avatar = await loadImage(imageURL);
        if (!avatar) throw new Error('Failed to load avatar image.');

        // Adjust the position of the avatar overlay
        const avatarX = 86;
        const avatarY = 215;
        const avatarWidth = 575;
        const avatarHeight = 392;
        ctx.drawImage(avatar, avatarX, avatarY, avatarWidth, avatarHeight);

        // Return the canvas buffer
        return canvas.toBuffer();
    } catch (error) {
        console.error('Error creating wanted image:', error.message);
        throw new Error('Error creating wanted image. Please try again.');
    }
}

module.exports = createWantedImage;
