const createPetpetGif = require('../utils/petpet');

module.exports = {
    name: 'petpet',
    // parameters
    //image
    //resolution
    //delay
    //backgroundColor
    run: async (req, res) => {
        const { image, resolution, delay, backgroundColor } = req.query;

        if (!image) {
            return res.status(400).json({ error: 'Please provide an image URL.' });
        }

        // Validate resolution and delay
        const resolutionValue = parseInt(resolution) || 128; // Default to 128 if not provided
        const delayValue = parseInt(delay) || 20; // Default to 20 if not provided

        if (resolutionValue <= 0) {
            return res.status(400).json({ error: 'Resolution must be a positive number.' });
        }

        if (delayValue <= 0) {
            return res.status(400).json({ error: 'Delay must be a positive number.' });
        }

        try {
            const gifData = await createPetpetGif(image, resolutionValue, delayValue, backgroundColor);
            res.set({ 'Content-Type': 'image/gif' });
            res.send(gifData);
        } catch (error) {
            console.error('Error generating Petpet GIF:', error);

            if (error.message.includes('Error loading the avatar image')) {
                return res.status(400).json({ error: 'Invalid avatar image URL.' });
            } else if (error.message.includes('Error loading the pet image for frame')) {
                return res.status(500).json({ error: 'Server error while generating the GIF.' });
            } else {
                return res.status(500).json({ error: 'An unexpected error occurred.' });
            }
        }
    }
};
