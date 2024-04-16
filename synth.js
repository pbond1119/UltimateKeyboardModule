// Importing the Keyboard and Arpeggiator
import { setupSynthKeyboard } from "./keyboard.js";
import { Arpeggiator, MidiManager } from "./Arpeggiator.js";

// Enable WebMidi API and handle any errors if it fails to enable.
// This is necessary to work with MIDI devices in the web browser.
await WebMidi.enable();

// Initialize variables to store the first MIDI input and output devices detected.
// These devices can be used to send or receive MIDI messages.
let myInput = WebMidi.inputs[0];



// Create our Audio Context
const siteAudio = new AudioContext();


// grabbing HTML objects for external keyboard and volume
let dropInsIO = document.getElementById("dropdown-insIO");
const gainControl = document.getElementById("gainSlider");

// HTML objects for Oscilattor 1
const asdrFolder1 = document.getElementById("asdrFolder1");
const attackControl1 = document.getElementById("attackSlider1");
const decayControl1 = document.getElementById("decaySlider1");
const sustainControl1 = document.getElementById("sustainSlider1");
const releaseControl1 = document.getElementById("releaseSlider1");
const transposeControl1 = document.getElementById("transposeSlider1");
const waveShape1 = document.getElementById("waveShape1");


// HTML objects for Oscilattor 2
const asdrFolder2 = document.getElementById("asdrFolder2");
const attackControl2 = document.getElementById("attackSlider2");
const decayControl2 = document.getElementById("decaySlider2");
const sustainControl2 = document.getElementById("sustainSlider2");
const releaseControl2 = document.getElementById("releaseSlider2");
const transposeControl2 = document.getElementById("transposeSlider2");
const waveShape2 = document.getElementById("waveShape2");

// HTML objects for Chord Select Module
const chordFolder = document.getElementById("chordFolder");
const offChord = document.getElementById("offChord");
const majChord = document.getElementById("majChord");
const minChord = document.getElementById("minChord");
const augChord = document.getElementById("augChord");
const dimChord = document.getElementById("dimChord");
const maj7Chord = document.getElementById("maj7Chord");
const min7Chord = document.getElementById("min7Chord");
const dom7Chord = document.getElementById("dom7Chord");

// HTML objects for Note Repeat
const repeatFolder = document.getElementById("repeatFolder");
const repeatDropdown = document.getElementById("repeatDropdown");

// HTML objects for Arpeggiator
const arpFolder = document.getElementById("arpFolder");
const bpmValue = document.getElementById("bpmValue");
const bpmSet = document.getElementById("bpmSet");
const subdiv = document.getElementById("subdiv");
const noteLengthValue = document.getElementById("noteLengthValue");

// For each MIDI input device detected, add an option to the input devices dropdown.
// This loop iterates over all detected input devices, adding them to the dropdown.
WebMidi.inputs.forEach(function (input, num) {
  dropInsIO.innerHTML += `<option value=${num}>${input.name}</option>`;
});

// // set up gain nodes
// const adsrNode = siteAudio.createGain();
// const gainNode = siteAudio.createGain();

// // set intial gain values for both gain nodes
// adsrNode.gain.value = 0; //linear amplitude
// gainNode.gain.value = 0; //linear amplitude

// create new oscillator node
// let oscillator1 = siteAudio.createOscillator();
// let oscillator2 = siteAudio.createOscillator();


// // connect nodes for signal flow
// oscillator.connect(adsrNode);
// adsrNode.connect(gainNode);
// gainNode.connect(siteAudio.destination);

// // oscillator initial settings
// oscillator.type = "square";
// oscillator.frequency.setValueAtTime(110, siteAudio.currentTime);

// // start the oscillator
// oscillator.start();


// GETTING HTML FOR KEYS
const getElementByNote = (note) =>
  note && document.querySelector(`[note="${note}"]`);

const keys = {
  A: { element: getElementByNote("C"), note: "C", octaveOffset: 0 },
  W: { element: getElementByNote("C#"), note: "C#", octaveOffset: 0 },
  S: { element: getElementByNote("D"), note: "D", octaveOffset: 0 },
  E: { element: getElementByNote("D#"), note: "D#", octaveOffset: 0 },
  D: { element: getElementByNote("E"), note: "E", octaveOffset: 0 },
  F: { element: getElementByNote("F"), note: "F", octaveOffset: 0 },
  T: { element: getElementByNote("F#"), note: "F#", octaveOffset: 0 },
  G: { element: getElementByNote("G"), note: "G", octaveOffset: 0 },
  Y: { element: getElementByNote("G#"), note: "G#", octaveOffset: 0 },
  H: { element: getElementByNote("A"), note: "A", octaveOffset: 1 },
  U: { element: getElementByNote("A#"), note: "A#", octaveOffset: 1 },
  J: { element: getElementByNote("B"), note: "B", octaveOffset: 1 },
  K: { element: getElementByNote("C2"), note: "C", octaveOffset: 1 },
  O: { element: getElementByNote("C#2"), note: "C#", octaveOffset: 1 },
  L: { element: getElementByNote("D2"), note: "D", octaveOffset: 1 },
  P: { element: getElementByNote("D#2"), note: "D#", octaveOffset: 1 },
  semicolon: { element: getElementByNote("E2"), note: "E", octaveOffset: 1 }
};

// Funtion to Determine Pitch of played not
const getHz = (note = "A", octave = 4) => {
  const A4 = 440;
  let N = 0;
  switch (note) {
    default:
    case "A":
      N = 0;
      break;
    case "A#":
    case "Bb":
      N = 1;
      break;
    case "B":
      N = 2;
      break;
    case "C":
      N = 3;
      break;
    case "C#":
    case "Db":
      N = 4;
      break;
    case "D":
      N = 5;
      break;
    case "D#":
    case "Eb":
      N = 6;
      break;
    case "E":
      N = 7;
      break;
    case "F":
      N = 8;
      break;
    case "F#":
    case "Gb":
      N = 9;
      break;
    case "G":
      N = 10;
      break;
    case "G#":
    case "Ab":
      N = 11;
      break;
  }
  N += 12 * (octave - 4);
  return A4 * Math.pow(2, N / 12);
};


const pressedNotes = new Map();
let clickedKey = "";

// function in charge of the sound
const playKey = (key) => {
  if (!keys[key]) {
    return;
  }

  const osc1 = siteAudio.createOscillator();
  const osc2 = siteAudio.createOscillator();
  const noteASDR1 = siteAudio.createGain();
  const noteASDR2 = siteAudio.createGain();
  const siteGain = siteAudio.createGain();


  osc1.connect(noteASDR1);
  osc2.connect(noteASDR2);
  noteASDR1.connect(siteGain)
  noteASDR2.connect(siteGain)
  siteGain.connect(siteAudio.destination);


// INITIAL SETTINGS FOR OSCILLATOR 1


// this seems like it is in linamp, convert to decibels
  const zeroGain = 0.00001;
  const maxGain = 0.5;
  const sustainedGain = 0.001;


  noteASDR1.gain.value = zeroGain;
  noteASDR2.gain.value = zeroGain;


  // ASDR FOR OSCILLATOR 1
  const setAttack1 = () =>
  noteASDR1.gain.exponentialRampToValueAtTime(
      maxGain,
      siteAudio.currentTime + 0.01
    );
  const setSustain1 = () =>
   noteASDR1.gain.exponentialRampToValueAtTime(
      maxGain,
      siteAudio.currentTime + 0.01
    );
  const setDecay1 = () =>
  noteASDR1.gain.exponentialRampToValueAtTime(
      sustainedGain,
      siteAudio.currentTime + 1
    );
  const setRelease1 = () =>
  noteASDR1.gain.exponentialRampToValueAtTime(
      zeroGain,
      siteAudio.currentTime + 2
    );

  function setWaveShape1 () {
    let selectedWaveShape1 = waveShape1.value;
    osc1.type = selectedWaveShape1
  }
  setAttack1();
  setDecay1();
  setRelease1();
  setWaveShape1();

// ASDR FOR OSCILLATOR 1
  const setAttack2 = () =>
  noteASDR1.gain.exponentialRampToValueAtTime(
      maxGain,
      siteAudio.currentTime + 0.01
     );
  const setSustain2 = () =>
    noteASDR1.gain.exponentialRampToValueAtTime(
      maxGain,
      siteAudio.currentTime + 0.01
    );
  const setDecay2 = () =>
    noteASDR1.gain.exponentialRampToValueAtTime(
      sustainedGain,
      siteAudio.currentTime + 1
    );
  const setRelease2 = () =>
    noteASDR1.gain.exponentialRampToValueAtTime(
      zeroGain,
       siteAudio.currentTime + 2
      );
  
    function setWaveShape2 () {
      let selectedWaveShape2 = waveShape2.value;
      osc2.type = selectedWaveShape2
    }
    setAttack2();
    setDecay2();
    setRelease2();
    setWaveShape2();
 
  

    // // ASDR FOR OSCILLATOR 2
    // const setAttack = () =>
    // noteASDR2.gain.exponentialRampToValueAtTime(
    //     maxGain,
    //     siteAudio.currentTime + 0.01
    //   );
    // const setSustain = () =>
    //  noteASDR2.gain.exponentialRampToValueAtTime(
    //     maxGain,
    //     siteAudio.currentTime + 0.01
    //   );
    // const setDecay = () =>
    // noteASDR2.gain.exponentialRampToValueAtTime(
    //     sustainedGain,
    //     siteAudio.currentTime + 1
    //   );
    // const setRelease = () =>
    // noteASDR2.gain.exponentialRampToValueAtTime(
    //     zeroGain,
    //     siteAudio.currentTime + 2
    //   );
  
    // setAttack();
    // setDecay();
    // setRelease();
  
  
    // osc2.type = "triangle";

  const freq = getHz(keys[key].note, (keys[key].octaveOffset || 0) + 3);

  if (Number.isFinite(freq)) {
    osc1.frequency.value = freq;
    osc2.frequency.value = freq;
  }

  keys[key].element.classList.add("pressed");
  pressedNotes.set(key, osc1, osc2);
  pressedNotes.get(key).start();
};

const stopKey = (key) => {
  if (!keys[key]) {
    return;
  }

  keys[key].element.classList.remove("pressed");
  const osc1 = pressedNotes.get(key);
  const osc2 = pressedNotes.get(key);
  if (osc1, osc2) {
    setTimeout(() => {
      osc1.stop();
      osc2.stop();
    }, 2000);

    pressedNotes.delete(key);
  }
};

document.addEventListener("keydown", (e) => {
  const eventKey = e.key.toUpperCase();
  const key = eventKey === ";" ? "semicolon" : eventKey;
  
  if (!key || pressedNotes.get(key)) {
    return;
  }
  playKey(key);
});

document.addEventListener("keyup", (e) => {
  const eventKey = e.key.toUpperCase();
  const key = eventKey === ";" ? "semicolon" : eventKey;
  
  if (!key) {
    return;
  }
  stopKey(key);
});

for (const [key, { element }] of Object.entries(keys)) {
  element.addEventListener("mousedown", () => {
    playKey(key);
    clickedKey = key;
  });
}

document.addEventListener("mouseup", () => {
  stopKey(clickedKey);
});


// ASDR1 CONNECTION TO HTML Sliders
// const updateASDRFolder1 = function (){
//   const attackValue = parseFloat(attackControl1.value);
//   const releaseValue = parseFloat(releaseControl1.value);
//   const sustainValue = parseFloat(sustainControl1.value);
//   const decayValue = parseFloat(decayControl1.value);
//   const transposeValue = parseFloat(transposeControl1.value);
//   const waveShapeValue = waveShape1.value;
//   asdrFolder1.innerText = `A: ${attackValue}, R: ${releaseValue}, S: ${sustainValue}, D: ${decayValue}, Transpose: ${transposeValue} semitones, Wave Shape: ${waveShapeValue}`;
// }
const updateAttack1 = function () {
  let sliderVal = parseFloat(attackControl1.value);
  document.getElementById("attackDisplay1").innerText = `${sliderVal} ms`;
};

const updateDecay1 = function () {
  let sliderVal = parseFloat(decayControl1.value);
  document.getElementById("decayDisplay1").innerText = `${sliderVal} ms`;
};

const updateSustain1 = function () {
  let sliderVal = parseFloat(sustainControl1.value);
  document.getElementById("sustainDisplay1").innerText = `${sliderVal} dB`;
};

const updateRelease1 = function () {
  let sliderVal = parseFloat(releaseControl1.value);
  document.getElementById("releaseDisplay1").innerText = `${sliderVal} ms`;
};

const updateTranspose1 = function () {
  let sliderVal = parseFloat(transposeControl1.value);
  document.getElementById("transposeDisplay1").innerText = `${sliderVal} semitones`;
};

// updateASDRFolder1();

// ASDR2 CONNECTION TO HTML Sliders
const updateAttack2 = function () {
  let sliderVal = parseFloat(attackControl2.value);
  document.getElementById("attackDisplay2").innerText = `${sliderVal} ms`;
};

const updateDecay2 = function () {
  let sliderVal = parseFloat(decayControl2.value);
  document.getElementById("decayDisplay2").innerText = `${sliderVal} ms`;
};

const updateSustain2 = function () {
  let sliderVal = parseFloat(sustainControl2.value);
  document.getElementById("sustainDisplay2").innerText = `${sliderVal} dB`;
};

const updateRelease2 = function () {
  let sliderVal = parseFloat(releaseControl2.value);
  document.getElementById("releaseDisplay2").innerText = `${sliderVal} ms`;
};

const updateTranspose2 = function () {
  let sliderVal = parseFloat(transposeControl2.value);
  document.getElementById("transposeDisplay2").innerText = `${sliderVal} semitones`;
};



// EVENT LISTENERS
// attackControl1.addEventListener("input", updateASDRFolder1Text);
// releaseControl1.addEventListener("input", updateASDRFolder1Text);
// sustainControl1.addEventListener("input", updateASDRFolder1Text);
// decayControl1.addEventListener("input", updateASDRFolder1Text);
// transposeControl1.addEventListener("input", updateASDRFolder1Text);
// waveShape1.addEventListener("change", updateASDRFolder1Text);

attackControl1.addEventListener("input", updateAttack1);
decayControl1.addEventListener("input", updateDecay1);
sustainControl1.addEventListener("input", updateSustain1);
releaseControl1.addEventListener("input", updateRelease1);
transposeControl1.addEventListener("input", updateTranspose1);
// waveShape1.addEventListener("change", setWaveShape1);

attackControl2.addEventListener("input", updateAttack2);
decayControl2.addEventListener("input", updateDecay2);
sustainControl2.addEventListener("input", updateSustain2);
releaseControl2.addEventListener("input", updateRelease2);
transposeControl2.addEventListener("input", updateTranspose2);
// waveShape2.addEventListener("change", setWaveShape2);




// ONE THAT DOESNT WORK RN

// FIGURE OUT A WAY TO GET THIS TO WORK AS A SEPERATE JS FILE
// const getElementByNote = (note) =>
//   note && document.querySelector(`[note="${note}"]`);

// const keys = {
//   A: { element: getElementByNote("C"), note: "C", octaveOffset: 0 },
//   W: { element: getElementByNote("C#"), note: "C#", octaveOffset: 0 },
//   S: { element: getElementByNote("D"), note: "D", octaveOffset: 0 },
//   E: { element: getElementByNote("D#"), note: "D#", octaveOffset: 0 },
//   D: { element: getElementByNote("E"), note: "E", octaveOffset: 0 },
//   F: { element: getElementByNote("F"), note: "F", octaveOffset: 0 },
//   T: { element: getElementByNote("F#"), note: "F#", octaveOffset: 0 },
//   G: { element: getElementByNote("G"), note: "G", octaveOffset: 0 },
//   Y: { element: getElementByNote("G#"), note: "G#", octaveOffset: 0 },
//   H: { element: getElementByNote("A"), note: "A", octaveOffset: 1 },
//   U: { element: getElementByNote("A#"), note: "A#", octaveOffset: 1 },
//   J: { element: getElementByNote("B"), note: "B", octaveOffset: 1 },
//   K: { element: getElementByNote("C2"), note: "C", octaveOffset: 1 },
//   O: { element: getElementByNote("C#2"), note: "C#", octaveOffset: 1 },
//   L: { element: getElementByNote("D2"), note: "D", octaveOffset: 1 },
//   P: { element: getElementByNote("D#2"), note: "D#", octaveOffset: 1 },
//   semicolon: { element: getElementByNote("E2"), note: "E", octaveOffset: 1 }
// };

// const getHz = (note = "A", octave = 4) => {
//   const A4 = 440;
//   let N = 0;
//   switch (note) {
//     default:
//     case "A":
//       N = 0;
//       break;
//     case "A#":
//     case "Bb":
//       N = 1;
//       break;
//     case "B":
//       N = 2;
//       break;
//     case "C":
//       N = 3;
//       break;
//     case "C#":
//     case "Db":
//       N = 4;
//       break;
//     case "D":
//       N = 5;
//       break;
//     case "D#":
//     case "Eb":
//       N = 6;
//       break;
//     case "E":
//       N = 7;
//       break;
//     case "F":
//       N = 8;
//       break;
//     case "F#":
//     case "Gb":
//       N = 9;
//       break;
//     case "G":
//       N = 10;
//       break;
//     case "G#":
//     case "Ab":
//       N = 11;
//       break;
//   }
//   N += 12 * (octave - 4);
//   return A4 * Math.pow(2, N / 12);
// };

// const pressedNotes = new Map();
// let clickedKey = "";

// const playKey = (key) => {
//   if (!keys[key]) {
//     return;
//   }

//   // const osc = siteAudio.createOscillator();
//   const noteGainNode = siteAudio.createGain();
//   noteGainNode.connect(siteAudio.destination);

//   const zeroGain = 0.00001;
//   const maxGain = 0.5;
//   const sustainedGain = 0.001;

//   noteGainNode.gain.value = zeroGain;

//   const setAttack = () =>
//     noteGainNode.gain.exponentialRampToValueAtTime(
//       maxGain,
//       siteAudio.currentTime + 0.01
//     );
//   const setDecay = () =>
//     noteGainNode.gain.exponentialRampToValueAtTime(
//       sustainedGain,
//       siteAudio.currentTime + 1
//     );
//   const setRelease = () =>
//     noteGainNode.gain.exponentialRampToValueAtTime(
//       zeroGain,
//       siteAudio.currentTime + 2
//     );

//   setAttack();
//   setDecay();
//   setRelease();

//   oscillator1.connect(noteGainNode);
//   oscillator2.connect(noteGainNode);
//   oscillator1.type = "square";
//   oscillator2.type = "triangle";

//   const freq = getHz(keys[key].note, (keys[key].octaveOffset || 0) + 3);

//   if (Number.isFinite(freq)) {
//     oscillator1.frequency.value = freq;
//     oscillator2.frequency.value = freq;
//   }

//   keys[key].element.classList.add("pressed");
//   pressedNotes.set(key, oscillator1,);
//   pressedNotes.set(key, oscillator2);
//   pressedNotes.get(key).start();
// };

// const stopKey = (key) => {
//   if (!keys[key]) {
//     return;
//   }

//   keys[key].element.classList.remove("pressed");
//   const oscillator1 = pressedNotes.get(key);
//   const oscillator2 = pressedNotes.get(key);

//   if (oscillator1, oscillator2) {
//     setTimeout(() => {
//       oscillator1.stop();
//       oscillator2.stop();
//     }, 2000);

//     pressedNotes.delete(key);
//   }
// };

// document.addEventListener("keydown", (e) => {
//   const eventKey = e.key.toUpperCase();
//   const key = eventKey === ";" ? "semicolon" : eventKey;
  
//   if (!key || pressedNotes.get(key)) {
//     return;
//   }
//   playKey(key);
// });

// document.addEventListener("keyup", (e) => {
//   const eventKey = e.key.toUpperCase();
//   const key = eventKey === ";" ? "semicolon" : eventKey;
  
//   if (!key) {
//     return;
//   }
//   stopKey(key);
// });

// for (const [key, { element }] of Object.entries(keys)) {
//   element.addEventListener("mousedown", () => {
//     playKey(key);
//     clickedKey = key;
//   });
// }

// document.addEventListener("mouseup", () => {
//   stopKey(clickedKey);
// });







// // PUT RADIO STUFF CHORD BUILDER HERE (FIGURE OUT IF THERES A BETTER WAY TO DO IT)
// // PUT NOTE REPEAT STUFF HERE

// // For each MIDI input device detected, add an option to the input devices dropdown.
// // This loop iterates over all detected input devices, adding them to the dropdown.
// WebMidi.inputs.forEach(function (input, num) {
//   dropInsIO.innerHTML += `<option value=${num}>${input.name}</option>`;
// });

// // set up gain nodes
// const adsrNode = siteAudio.createGain();
// const gainNode = siteAudio.createGain();

// // set intial gain values for both gain nodes
// adsrNode.gain.value = 0; //linear amplitude
// gainNode.gain.value = 0; //linear amplitude

// // create new oscillator node
// oscillator = siteAudio.createOscillator();

// // connect nodes for signal flow
// oscillator.connect(adsrNode);
// adsrNode.connect(gainNode);
// gainNode.connect(siteAudio.destination);

// // oscillator initial settings
// oscillator.type = "square";
// oscillator.frequency.setValueAtTime(110, siteAudio.currentTime);

// // start the oscillator
// oscillator.start();


// const updateGain = function () {
//   siteAudio.resume();
//   let sliderVal = parseFloat(gainControl.value);
//   document.getElementById("gainDisplay").innerText = `${sliderVal} dBFS`;
//   let linAmp = 10 ** (sliderVal / 20);
//   gainNode.gain.setValueAtTime(linAmp, siteAudio.currentTime);
// };

// const updateAttack = function () {
//   let sliderVal = parseFloat(attackControl.value);
//   document.getElementById("attackDisplay").innerText = `${sliderVal} ms`;
// };

// const updateRelease = function () {
//   let sliderVal = parseFloat(releaseControl.value);
//   document.getElementById("releaseDisplay").innerText = `${sliderVal} ms`;
// };

// // Add an event listener for the 'change' event on the input devices dropdown.
// // This allows the script to react when the user selects a different MIDI input device.
// dropInsIO.addEventListener("change", function () {
//   // Before changing the input device, remove any existing event listeners
//   // to prevent them from being called after the device has been changed.
//   if (myInput.hasListener("noteon")) {
//     myInput.removeListener("noteon");
//   }
//   if (myInput.hasListener("noteoff")) {
//     myInput.removeListener("noteoff");
//   }

//   // Change the input device based on the user's selection in the dropdown.
//   myInput = WebMidi.inputs[dropInsIO.value];

//   // After changing the input device, add new listeners for 'noteon' and 'noteoff' events.
//   // These listeners will handle MIDI note on (key press) and note off (key release) messages.
//   myInput.addListener("noteon", function (someMIDI) {
//     // When a note on event is received, send a note on message to the output device.
//     // This can trigger a sound or action on the MIDI output device.
//     let freq = 440 * 2 ** ((someMIDI.note.number - 69) / 12);
//     oscillator.frequency.setValueAtTime(freq, siteAudio.currentTime);
//     let waveform = someMIDI.note.rawattack > 64 ? "square" : "since";
//     oscillator.type = waveform;
//     startTone();
//   });

//   myInput.addListener("noteoff", function (someMIDI) {
//     // Similarly, when a note off event is received, send a note off message to the output device.
//     // This signals the end of a note being played.
//     console.log("noteOFF");
//     stopTone();
//   });
// });


// // Event Listeners
// gainControl.addEventListener("input", updateGain);

// attackControl1.addEventListener("input", updateAttack);
// decaySlider1.addEventListener("input", updateRelease);
// sustainSlider1.addEventListener("input", updateAttack);
// releaseControl1.addEventListener("input", updateRelease);
// transposeSlider1.addEventListener("input", updateRelease);


// attackControl2.addEventListener("input", updateAttack);
// decaySlider2.addEventListener("input", updateRelease);
// sustainSlider2.addEventListener("input", updateAttack);
// releaseControl2.addEventListener("input", updateRelease);
// transposeSlider2.addEventListener("input", updateRelease)