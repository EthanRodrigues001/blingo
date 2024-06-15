const createWantedImage = require('../utils/wantedGenerator');

module.exports = {
    name: 'wanted',
    // parameters
    //image
    run: async (req, res) => {
        const { image } = req.query;

        if (!image) {
            return res.status(400).json({ error: 'Please provide an image URL.' });
        }

        try {
            const buffer = await createWantedImage(image);
            res.set({ 'Content-Type': 'image/png' });
            res.send(buffer);
        } catch (error) {
            console.error('Error generating wanted image:', error);

            if (error.message.includes('Cannot load avatar')) {
                return res.status(400).json({ error: 'Invalid avatar image URL.' });
            } else {
                return res.status(500).json({ error: 'An unexpected error occurred.' });
            }
        }
    }
};
