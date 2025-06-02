const pdfParse = require('pdf-parse');

const extractPdfText = async (buffer) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new TypeError('Invalid or missing buffer in extractPdfText');
    }

    try {
        const data = await pdfParse(buffer);
        // Clean up the text: replace multiple newlines with one, trim, and remove extra spaces
        let formattedText = data.text
            .replace(/\r\n/g, '\n')           // Normalize line endings
            .replace(/\n{2,}/g, '\n')         // Replace multiple newlines with a single newline
            .replace(/[ \t]+\n/g, '\n')       // Remove trailing spaces before newlines
            .replace(/\n[ \t]+/g, '\n')       // Remove leading spaces after newlines
            .trim()
            .replace(/\s+/g, ' ')
            .trim();


        //   console.log(formattedText);

        return formattedText;
    } catch (error) {
        console.error("Error during PDF parsing:", error);
        throw error;
    }
};

module.exports = extractPdfText;