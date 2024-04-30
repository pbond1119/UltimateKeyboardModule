// impliment ontap feature for mobile use if time allows, CUT OUT SECOND OSCILLATOR

// Importing the Keyboard and Arpeggiator sdfg
import { setupSynthKeyboard } from "./keyboard.js";
import { Arpeggiator, MidiManager } from "./Arpeggiator.js";
// import { musicTools } from "./MusicTools.js";

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

const adsr1 = {
  attack: 0.02,
  decay: 0.5,
  sustain: 0.17,
  release: 0.5,
};

const activeVoices = new Map();

// HTML objects for Oscilattor 1
const asdrFolder1 = document.getElementById("asdrFolder1");
const attackControl1 = document.getElementById("attackSlider1");
const decayControl1 = document.getElementById("decaySlider1");
const sustainControl1 = document.getElementById("sustainSlider1");
const releaseControl1 = document.getElementById("releaseSlider1");
const transposeControl1 = document.getElementById("transposeSlider1");
const waveShape1 = document.getElementById("waveShape1");

// HTML objects for Chord Select Module
const chordFolder = document.getElementById("chordFolder");
const chordList = document.getElementById("chordList");
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
  semicolon: { element: getElementByNote("E2"), note: "E", octaveOffset: 1 },
};

// establish funcitons
let setAttack1 = function () {};
let setDecay1 = function () {};
let setSustain1 = function () {};
let setRelease1 = function () {};
let setWaveShape1 = function () {};

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

const osc1 = siteAudio.createOscillator();
const noteADSR1 = siteAudio.createGain();
const siteGain = siteAudio.createGain();

siteGain.connect(siteAudio.destination);

const pressedNotes = new Map();
let clickedKey = "";

// function in charge of the sound
const playKey = function (key) {
  if (!keys[key]) {
    return;
  }

  // Check if the key is already pressed
  if (pressedNotes.has(key)) {
    return;
  }
  let keyGrab = keys[key];
  const osc1 = siteAudio.createOscillator();
  const noteADSR1 = siteAudio.createGain();
  noteADSR1.gain.setValueAtTime(0, siteAudio.currentTime);

  osc1.connect(noteADSR1);
  noteADSR1.connect(siteGain);
  console.log(key.note);

  activeVoices.set(keyGrab.note, { osc1, noteADSR1 });
  console.log("playKey", activeVoices);

  // setAttack1 = () =>
  //   noteADSR1.gain.linearRampToValueAtTime(
  //     1,
  //     siteAudio.currentTime + adsr1.attack
  //   );
  // setDecay1 = () =>
  //   noteADSR1.gain.linearRampToValueAtTime(
  //     adsr1.sustain,
  //     siteAudio.currentTime + adsr1.attack + adsr1.decay
  //   );
  // // const setSustain1 = () =>
  // //   noteADSR1.gain.linearRampToValueAtTime(
  // //     adsr1.sustain,
  // //     zeroGain + parseFloat(sustainControl1.value)
  // //   );
  // setRelease1 = () =>
  //   noteADSR1.gain.linearRampToValueAtTime(
  //     0,
  //     siteAudio.currentTime + adsr1.release
  //   );

  let setWaveShape1 = function () {
    let selectedWaveShape1 = waveShape1.value;
    osc1.type = selectedWaveShape1;
  };

  const freq = getHz(keys[key].note, (keys[key].octaveOffset || 0) + 3);

  if (Number.isFinite(freq)) {
    osc1.frequency.value = freq;
  }

  keys[key].element.classList.add("pressed");
  pressedNotes.set(key, osc1);
  osc1.start();
  noteADSR1.gain.linearRampToValueAtTime(
    1,
    siteAudio.currentTime + adsr1.attack
  );
  noteADSR1.gain.linearRampToValueAtTime(
    adsr1.sustain,
    siteAudio.currentTime + adsr1.attack + adsr1.decay
  );
  console.log(adsr1.attack, adsr1.decay, adsr1.sustain);

  siteAudio.resume;

  setWaveShape1();
};

setAttack1();
setDecay1();
// setSustain1();
setRelease1();
setWaveShape1();

const stopKey = function (key) {
  if (!keys[key]) {
    return;
  }

  let keyGrab = keys[key];
  console.log(activeVoices);
  const voice = activeVoices.get(keyGrab.note);
  console.log(voice);

  voice.noteADSR1.gain.linearRampToValueAtTime(
    0,
    siteAudio.currentTime + adsr1.release
  );

  keys[key].element.classList.remove("pressed");
  const osc1 = pressedNotes.get(key);
  setTimeout(() => {
    voice.osc1.stop();
    voice.osc1.disconnect();

    activeVoices.delete(key);
  }, adsr1.release * 1000);

  pressedNotes.delete(key);
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

const updateAttackDisplay = function () {
  let sliderVal = parseFloat(attackControl1.value);
  adsr1.attack = sliderVal / 1000;
  // convert to seconds
  document.getElementById("attackDisplay1").innerText = `${sliderVal} ms`;
};

// const updateAttackValue = function () {
//   adsr1.attack = parseFloat(attackControl1.value / 1000);
//   console.log(adsr1.attack.value);
//   console.log(attackControl1.value);
// };

const updateAttackValue = function (adsr1) {
  adsr1.attack = parseFloat(attackControl1.value / 1000);
};

const updateDecayDisplay = function () {
  let sliderVal = parseFloat(decayControl1.value);
  document.getElementById("decayDisplay1").innerText = `${sliderVal} ms`;
};

const updateDecayValue = function () {
  adsr1.decay = parseFloat(decayControl1.value / 1000);
  console.log(adsr1.decay.value);
  console.log(decayControl1.value);
};

const updateSustainDisplay = function () {
  let sliderVal = parseFloat(sustainControl1.value);
  // convert to linear amplitude
  document.getElementById("sustainDisplay1").innerText = `${sliderVal} dB`;
};

const updateSustainValue = function () {
  adsr1.sustain = parseFloat(Math.pow(10, sustainControl1.value / 20));
  console.log(adsr1.sustain.value);
  console.log(sustainControl1.value);
};

const updateReleaseDisplay = function () {
  let sliderVal = parseFloat(releaseControl1.value);
  document.getElementById("releaseDisplay1").innerText = `${sliderVal} ms`;
};

const updateReleaseValue = function () {
  adsr1.release = parseFloat(releaseControl1.value / 1000);
  console.log(adsr1.release.value);
  console.log(releaseControl1.value);
};

const updateTranspose1 = function () {
  let sliderVal = parseFloat(transposeControl1.value);
  document.getElementById(
    "transposeDisplay1"
  ).innerText = `${sliderVal} semitones`;
};

// updateASDRFolder1();

const updateGain = function () {
  siteAudio.resume();
  let sliderVal = parseFloat(gainControl.value);
  document.getElementById("gainDisplay").innerText = `${sliderVal} dBFS`;
  let linAmp = 10 ** (sliderVal / 20);
  gainControl.gain.setValueAtTime(linAmp, siteAudio.currentTime);
};

// CHORD BUILDER
document.getElementById("offChord").addEventListener("change", function () {
  console.log(this.checked);
  if (this.checked) {
    console.log("Chord Build Off");
  }
});

document.getElementById("majChord").addEventListener("change", function () {
  console.log(this.checked);
  if (this.checked) {
    console.log("Chord Build = Major");
  }
});

document.getElementById("minChord").addEventListener("change", function () {
  console.log(this.checked);
  if (this.checked) {
    console.log("Chord Build = Minor");
  }
});

document.getElementById("augChord").addEventListener("change", function () {
  console.log(this.checked);
  if (this.checked) {
    console.log("Chord Build = Augmented");
  }
});

document.getElementById("dimChord").addEventListener("change", function () {
  console.log(this.checked);
  if (this.checked) {
    console.log("Chord Build = Diminished");
  }
});

document.getElementById("maj7Chord").addEventListener("change", function () {
  console.log(this.checked);
  if (this.checked) {
    console.log("Chord Build = Major 7");
  }
});

document.getElementById("min7Chord").addEventListener("change", function () {
  console.log(this.checked);
  if (this.checked) {
    console.log("Chord Build = Minor 7");
  }
});

document.getElementById("dom7Chord").addEventListener("change", function () {
  console.log(this.checked);
  if (this.checked) {
    console.log("Chord Build = Dominant 7");
  }
});

// EVENT LISTENERS
// attackControl1.addEventListener("input", updateASDRFolder1Text);
// releaseControl1.addEventListener("input", updateASDRFolder1Text);
// sustainControl1.addEventListener("input", updateASDRFolder1Text);
// decayControl1.addEventListener("input", updateASDRFolder1Text);
// transposeControl1.addEventListener("input", updateASDRFolder1Text);
// waveShape1.addEventListener("change", updateASDRFolder1Text);

gainControl.addEventListener("input", updateGain);

attackControl1.addEventListener("input", updateAttackDisplay);
attackControl1.addEventListener("value", updateAttackValue);
decayControl1.addEventListener("input", updateDecayDisplay);
decayControl1.addEventListener("value", updateDecayValue);

sustainControl1.addEventListener("input", updateSustainDisplay);
sustainControl1.addEventListener("value", updateSustainValue);
releaseControl1.addEventListener("input", updateReleaseDisplay);
releaseControl1.addEventListener("value", updateReleaseValue);
transposeControl1.addEventListener("input", updateTranspose1);
// waveShape1.addEventListener("change", setWaveShape1);

updateAttackValue(adsr1);
updateDecayValue(adsr1);
updateSustainValue(adsr1);
updateReleaseValue(adsr1);
