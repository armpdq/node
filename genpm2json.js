const fs = require('fs');

const nodeCount = process.argv[2] || 3;
const scriptName = process.argv[3] || './app.js';
const startPort = process.argv[4] || 3001;

const res = { apps: [] };

for (let i = 0; i < nodeCount; i++) {
    res.apps.push({
        name: `node-${i}`,
        script: scriptName,
        args: [startPort + i]
    });
}

fs.writeFileSync('./pm2.json', JSON.stringify(res, null, '\t'));