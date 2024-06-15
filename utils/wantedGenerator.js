const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { createCanvas, loadImage, Image } = require('canvas');

async function createWantedImage(imageURL) {
    try {
        // Fetch the image and validate the response
        const response = await fetch(imageURL);
        if (!response.ok) {
            throw new Error('Failed to fetch image. Please ensure the URL is correct and the image is accessible.');
        }

        // Buffer the image
        const imageBuffer = await response.buffer();

        // Load the image using canvas
        const img = await loadImage(imageBuffer);

        // Create canvas and draw the images
        const canvas = createCanvas(736, 959);
        const ctx = canvas.getContext('2d');

        // Load background image from local file in the 'img' folder
        const background = await loadImage(path.join(__dirname, '..', 'img', 'wanted.jpg'));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Resize the user-provided image if necessary
        const maxDimension = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
            const scale = Math.min(maxDimension / width, maxDimension / height);
            width *= scale;
            height *= scale;
        }

        // Draw the resized user-provided image onto the canvas
        ctx.drawImage(img, 86, 215, width, height);

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