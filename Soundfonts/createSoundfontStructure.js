const fs = require('fs');
const path = require('path');

// Define the directory structure
const soundfontDirectory = 'YourSoundFont';
const instruments = [
    {
        name: 'DrumOnBase',
        notes: ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3']
    },
    // Add more instruments here if needed
];

// Create the main soundfont directory
fs.mkdirSync(soundfontDirectory);

// Create directories for each instrument
instruments.forEach((instrument) => {
    const instrumentDirectory = path.join(soundfontDirectory, instrument.name);
    fs.mkdirSync(instrumentDirectory);

    // Create WAV files for each note
    instrument.notes.forEach((note) => {
        fs.writeFileSync(path.join(instrumentDirectory, `${note}.wav`), '');
    });

    // Create the JavaScript file for the instrument
    fs.writeFileSync(path.join(instrumentDirectory, `${instrument.name}-mp3.js`), '');
});

console.log('Soundfont directory structure created successfully.');
