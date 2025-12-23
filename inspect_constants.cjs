const fs = require('fs');
const readline = require('readline');

async function inspect() {
    const fileStream = fs.createReadStream('constants.ts');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineNum = 0;
    for await (const line of rl) {
        lineNum++;
        if (line.includes('export const')) {
            console.log(`Line ${lineNum}: ${line.substring(0, 100)}`);
        }
    }
}

inspect();
