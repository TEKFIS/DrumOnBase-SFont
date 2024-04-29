const fs = require('fs');
const path = require('path');

// Path to your soundfont directory
const soundfontDirectory = '/Users/apple/Desktop/Realdrumonbase/website/src/js/Soundfonts/DrumOnBase-Sfont/DrumOnBase-mp3';

// Initialize an object to store the Base64-encoded audio data
const soundfontData = {};

// Function to encode audio file to Base64
function encodeAudioToBase64(filePath) {
    const fileData = fs.readFileSync(filePath);
    return fileData.toString('base64');
}

// Iterate through each audio file in the soundfont directory
fs.readdir(soundfontDirectory, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach(file => {
        // Check if the file is an audio file (e.g., WAV, MP3)
        if (file.endsWith('.wav') || file.endsWith('.mp3')) {
            const noteName = path.basename(file, path.extname(file)); // Extract the note name
            const filePath = path.join(soundfontDirectory, file);
            const base64Data = encodeAudioToBase64(filePath);
            soundfontData[noteName] = `data:audio/mp3;base64,${base64Data}`;
        }
    });

    // Write the soundfont data to a JavaScript file
    const outputFilePath = '/Users/apple/Desktop/Realdrumonbase/website/src/js/Soundfonts/DrumOnBase-Sfont/DrumOnBase-mp3.js';
    fs.writeFileSync(outputFilePath, `var Soundfont = ${JSON.stringify(soundfontData, null, 4)};\n`);
    console.log('Soundfont data has been written to', outputFilePath);
});
