module.exports = {
    name: 'example',
    run: async (req, res) => {
        try {
            // Your route logic here
            res.json({ message: 'This is an example endpoint' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    }
};
