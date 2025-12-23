const fs = require('fs');
const path = require('path');

const inputFile = 'constants.ts';
const outputFile = 'public/data.json';

async function extract() {
    console.log('Reading file...');
    const content = fs.readFileSync(inputFile, 'utf8');

    // Find start of DEFAULT_CSV_DATA
    const startMarker = 'export const DEFAULT_CSV_DATA = `';
    const startIdx = content.indexOf(startMarker);

    if (startIdx === -1) {
        console.error('Could not find DEFAULT_CSV_DATA');
        process.exit(1);
    }

    // Find the end. It's the backtick before "export const STOCK_NAMES_CSV"
    // or just parse looking for the next export.

    const endMarker = 'export const STOCK_NAMES_CSV';
    const endIdx = content.indexOf(endMarker);

    if (endIdx === -1) {
        console.error('Could not find STOCK_NAMES_CSV marker');
        process.exit(1);
    }

    // We need to back up from endIdx to find the closing backtick of the first export.
    // There should be a backtick, maybe some whitespace/semicolon.
    let closeTick = -1;
    for (let i = endIdx - 1; i > startIdx; i--) {
        if (content[i] === '`') {
            closeTick = i;
            break;
        }
    }

    if (closeTick === -1) {
        console.error('Could not find closing backtick');
        process.exit(1);
    }

    const csvData = content.substring(startIdx + startMarker.length, closeTick);

    console.log(`Extracted ${csvData.length} bytes of CSV data.`);

    const jsonContent = JSON.stringify({ csvData });

    fs.writeFileSync(outputFile, jsonContent);
    console.log(`Wrote to ${outputFile}`);
}

extract();
