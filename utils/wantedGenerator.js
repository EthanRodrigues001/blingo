const path = require('path');
const sharp = require('sharp');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { createCanvas, loadImage, Image } = require('canvas');

async function createWantedImage(imageURL) {
    try {
        // Fetch the image and validate the response
        const response = await fetch(imageURL);
        if (!response.ok) {
            throw new Error('Failed to fetch image. Please ensure the URL is correct and the image is accessible.');
        }

        // Buffer the image and process with sharp
        const imageBuffer = await response.buffer();
        let image = sharp(imageBuffer);

        const metadata = await image.metadata();
        const maxDimension = 1000; // Example maximum dimension

        if (metadata.width > maxDimension || metadata.height > maxDimension) {
            image = image.resize(maxDimension, maxDimension, { fit: 'inside' });
        }

        const resizedBuffer = await image.toBuffer();

        // Create canvas and draw the images
        const canvas = createCanvas(736, 959);
        const ctx = canvas.getContext('2d');

        // Load background image from local file in the 'img' folder
        const background = await loadImage(path.join(__dirname, '..', 'img', 'wanted.jpg'));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Load the (possibly resized) user-provided image
        const avatar = new Image();
        avatar.src = resizedBuffer;
        ctx.drawImage(avatar, 86, 215, 575, 392);

        // Return the canvas buffer
        return canvas.toBuffer();
    } catch (error) {
        console.error('Error creating wanted image:', error.message);
        if (error.message.includes('Unsupported image type')) {
            throw new Error('Unsupported image type. Please provide a valid image URL ending with .jpg or .png.');
        } else if (error.message.includes('Failed to load')) {
            throw new Error('Failed to load image. Please ensure the URL is correct and the image is accessible.');
        } else {
            throw new Error('Error creating wanted image. Please try again.');
        }
    }
}

module.exports = createWantedImage;
