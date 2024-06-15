const data = require('../jsondata/countries.json');
const data2 = require('../jsondata/country-coords.json');

module.exports = {
    name: 'country',
    run: async (req, res) => {
        try {
            const countryName = req.query.name;
            if (!countryName) {
                return res.status(400).json({ error: 'Provide a valid country name' });
            }

            const check1 = data.find(c => c.country.toLowerCase() === countryName.toLowerCase());
            const check2 = data2.find(c => c.country.toLowerCase() === countryName.toLowerCase());

            if (check1) {
                res.json({ country: check1 });
            } else if (check2) {
                const countryData = data.find(c => c.country.toLowerCase() === check2.name.toLowerCase());
                if (countryData) {
                    res.json({ country: countryData });
                } else {
                    res.status(404).json({ error: 'Country not found in the main dataset' });
                }
            } else {
                res.status(404).json({ error: 'Country not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An unexpected error occurred.' });
        }
    }
};
