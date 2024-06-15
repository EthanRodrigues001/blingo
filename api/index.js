const fs = require('fs');
const path = require('path');
const tokenCheck = require('../utils/tokenCheck');

module.exports = function(app) {
    const routes = [];

    fs.readdirSync(__dirname).forEach(function(file) {
        if (file === 'index.js') return;
        const name = file.substr(0, file.indexOf('.'));
        const route = require('./' + name);
        const routePath = `/api/${route.name}`;

        app.get(routePath, tokenCheck, async (req, res) => {
            try {
                await route.run(req, res);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'An unexpected error occurred.' });
            }
        });

        routes.push({ path: routePath, name: route.name });
    });

    // Logging loaded routes as a table
    console.table(routes.map(route => ({ 'Route Path': route.path, 'Name': route.name })));
};
