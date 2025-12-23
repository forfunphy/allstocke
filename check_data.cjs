
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'public/data.json');

try {
    // Read first 1000 chars to guess structure
    const fd = fs.openSync(dataPath, 'r');
    const buffer = Buffer.alloc(1000);
    fs.readSync(fd, buffer, 0, 1000, 0);
    console.log('First 1000 chars:', buffer.toString());
    fs.closeSync(fd);
} catch (e) {
    console.error(e);
}
