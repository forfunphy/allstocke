
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const dataPath = path.join(publicDir, 'data.json');

console.log('Reading data.json...');
try {
    const rawContent = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawContent);
    const csvContent = data.csvData;

    console.log(`Total CSV length: ${csvContent.length}`);

    // Aim for ~40MB chunks based on user request (<50MB)
    const CHUNK_SIZE = 40 * 1024 * 1024;

    let parts = [];
    let currentIndex = 0;

    while (currentIndex < csvContent.length) {
        let endIndex = Math.min(currentIndex + CHUNK_SIZE, csvContent.length);

        // Try to split at a newline to be clean, though not strictly necessary for simple concatenation
        if (endIndex < csvContent.length) {
            const lastNewline = csvContent.lastIndexOf('\n', endIndex);
            if (lastNewline > currentIndex) {
                endIndex = lastNewline + 1;
            }
        }

        parts.push(csvContent.substring(currentIndex, endIndex));
        currentIndex = endIndex;
    }

    console.log(`Splitting into ${parts.length} parts.`);

    parts.forEach((partContent, index) => {
        const partPart = {
            csvData: partContent,
            partIndex: index,
            totalParts: parts.length
        };
        const fileName = `data_part${index + 1}.json`;
        fs.writeFileSync(path.join(publicDir, fileName), JSON.stringify(partPart));
        console.log(`Written ${fileName} (${partContent.length} chars)`);
    });

    const manifest = {
        parts: parts.map((_, i) => `data_part${i + 1}.json`)
    };
    fs.writeFileSync(path.join(publicDir, 'data_manifest.json'), JSON.stringify(manifest));
    console.log('Written data_manifest.json');

} catch (error) {
    console.error("Error splitting file:", error);
}
