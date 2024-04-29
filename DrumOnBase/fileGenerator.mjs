import axios from 'axios';
import MidiWriter from 'midi-writer-js';
import fs from 'fs';

const getFilePath = (fileName, fileType) => {
  let directoryPath;
  if (fileType === 'midi') {
    directoryPath = '/Users/apple/Desktop/Realdrumonbase/website/src/js/Midi-Txt-file-output/Midi Files'; // Specify the directory path for MIDI files
  } else if (fileType === 'text') {
    directoryPath = '/Users/apple/Desktop/Realdrumonbase/website/src/js/Midi-Txt-file-output/Transaction logs '; // Specify the directory path for text files
  } else {
    throw new Error('Invalid file type');
  }
  return `${directoryPath}/${fileName}`;
};

const fetchTransactionData = async () => {
  try {
    const today = new Date();
    const utcYear = today.getUTCFullYear();
    const utcMonth = (today.getUTCMonth() + 1).toString().padStart(2, '0');
    const utcDay = today.getUTCDate().toString().padStart(2, '0');
    const JSON_FILE_URL = `https://raw.githubusercontent.com/drumonbase/txdata/main/transactions/${utcYear}/${utcMonth}/${utcYear}-${utcMonth}-${utcDay}.json`;
    console.log('Fetching transaction data from:', JSON_FILE_URL);

    const response = await axios.get(JSON_FILE_URL);
    const transactions = response.data;

    const seenHashes = new Set();
    const midiNotes = [];
    const transactionData = [];

    transactions.forEach(tx => {
      if (!seenHashes.has(tx.hash)) {
        seenHashes.add(tx.hash);
        console.log('Added transaction:', tx); // Print the entire transaction object

        // Convert UTC timestamps to UK local time
        const txDateUTC = new Date(tx.txDate);
        const txDateLocal = txDateUTC.toLocaleString('en-GB', { timeZone: 'Europe/London' });

        // Scale price to MIDI note
        const midiNote = scalePriceToMidi(parseFloat(tx.valueInUSD), 0, 2000);
        midiNotes.push(midiNote);

        // Construct the data to be written to the file
        const data = `txDate (UTC): ${tx.txDate}, txDate (UK local time): ${txDateLocal}, Transaction value in USD: ${tx.valueInUSD}, MIDI Note: ${midiNote}`;

        // Write data to the transaction_data.txt file
        //fs.appendFileSync('transaction_data.txt', data + '\n');

        // Push transaction data to the array for MIDI file generation
        transactionData.push({
          txDateUTC: tx.txDate,
          txDateLocal: txDateLocal,
          valueInUSD: tx.valueInUSD,
          midiNote: midiNote
        });
      }
    });

    // Generate MIDI file
    generateMidiFile(midiNotes);

    // Generate text file
    generateTextFile(transactionData);

  } catch (error) {
    console.error('Error fetching transaction data:', error);
  }

  // Schedule the next fetch in 1 minute
  setTimeout(fetchTransactionData, 60 * 1000);
};

const scalePriceToMidi = (price, minPrice, maxPrice) => {
  const minMidiNote = 0;
  const maxMidiNote = 127;
  let scaledMidiNote = Math.round((price - minPrice) / (maxPrice - minPrice) * (maxMidiNote - minMidiNote) + minMidiNote);
  // Ensure MIDI note is within the valid MIDI range
  scaledMidiNote = Math.min(Math.max(scaledMidiNote, minMidiNote), maxMidiNote);
  return scaledMidiNote;
};


const generateMidiFile = (midiNotes) => {
  const track = new MidiWriter.Track();
  const ticksPerQuarterNote = 120;

  midiNotes.forEach((midiNote) => {
    track.addEvent(new MidiWriter.NoteEvent({ pitch: [midiNote], duration: 'T' + ticksPerQuarterNote }));
  });

  const writer = new MidiWriter.Writer([track]);
  const midiFilePath = getFilePath(`transactions_${new Date().toISOString()}.mid`, 'midi');
  fs.writeFileSync(midiFilePath, writer.buildFile(), { encoding: 'binary' });
  console.log(`MIDI file saved as ${midiFilePath}`);
};

const generateTextFile = (transactionData) => {
  const textData = transactionData.map((data) => {
    return `txDate (UTC): ${data.txDateUTC}, txDate (UK local time): ${data.txDateLocal}, Transaction value in USD: ${data.valueInUSD}, MIDI Note: ${data.midiNote}\n`;
  }).join('');

  const textFilePath = getFilePath(`transaction_data_${new Date().toISOString()}.txt`, 'text');
  fs.writeFileSync(textFilePath, textData);
  console.log(`Text file saved as ${textFilePath}`);
};

// Start the initial fetch
//WERKING: PRINTS MIDI AND LOGS EVERY MINUTE (UK TIME)
fetchTransactionData();
