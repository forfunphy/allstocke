const fs = require('fs');

const inputFile = 'constants.ts';

function rewrite() {
    const content = fs.readFileSync(inputFile, 'utf8');
    const index = content.indexOf('export const STOCK_NAMES_CSV');

    if (index === -1) {
        console.error('Could not find STOCK_NAMES_CSV');
        process.exit(1);
    }

    const newContent = `// Processed data moved to public/data.json
export const DEFAULT_CSV_DATA = ""; 

` + content.substring(index);

    fs.writeFileSync(inputFile, newContent);
    console.log('Rewrote constants.ts');
}

rewrite();
