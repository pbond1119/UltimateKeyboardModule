import { Arpeggiator, MidiManager } from "./Arpeggiator.js";

// Enable WebMidi API and handle any errors if it fails to enable.
// This is necessary to work with MIDI devices in the web browser.
await WebMidi.enable();

// Initialize variables to store the first MIDI input and output devices detected.
// These devices can be used to send or receive MIDI messages.
let myInput = WebMidi.inputs[0];

// Create our Audio Context
const myAudio = new AudioContext();

// create a placeholder to store the oscillator. This is being done in the top scope so that it is available everywhere
let oscillator = null;

// grabbing HTML objects
let dropInsIO = document.getElementById("dropdown-insIO");
const gainControl = document.getElementById("gainSlider");

const attackControl1 = document.getElementById("attackSlider1");
const decayControl1 = document.getElementById("decaySlider1");
const sustainControl1 = document.getElementById("sustainSlider1");
const releaseControl1 = document.getElementById("releaseSlider1");

const attackControl2 = document.getElementById("attackSlider2");
const decayControl2 = document.getElementById("decaySlider2");
const sustainControl2 = document.getElementById("sustainSlider2");
const releaseControl2 = document.getElementById("releaseSlider2");

// PUT RADIO STUFF CHORD BUILDER HERE (FIGURE OUT IF THERES A BETTER WAY TO DO IT)
// PUT NOTE REPEAT STUFF HERE

// For each MIDI input device detected, add an option to the input devices dropdown.
// This loop iterates over all detected input devices, adding them to the dropdown.
WebMidi.inputs.forEach(function (input, num) {
  dropInsIO.innerHTML += `<option value=${num}>${input.name}</option>`;
});

// set up gain nodes
const adsrNode = myAudio.createGain();
const gainNode = myAudio.createGain();

// set intial gain values for both gain nodes
adsrNode.gain.value = 0; //linear amplitude
gainNode.gain.value = 0; //linear amplitude

// create new oscillator node
oscillator = myAudio.createOscillator();

// connect nodes for signal flow
oscillator.connect(adsrNode);
adsrNode.connect(gainNode);
gainNode.connect(myAudio.destination);

// oscillator initial settings
oscillator.type = "square";
oscillator.frequency.setValueAtTime(110, myAudio.currentTime);

// start the oscillator
oscillator.start();

/**
 * startTone ramps up to full volume over 2 seconds
 */
const startTone = function () {
  adsrNode.gain.linearRampToValueAtTime(
    1.0,
    myAudio.currentTime + parseFloat(attackControl.value) / 1000
  );
};

/**
 * stopTone ramps down to silence over 2 seconds
 */
const stopTone = function () {
  adsrNode.gain.linearRampToValueAtTime(
    0,
    myAudio.currentTime + parseFloat(releaseControl.value) / 1000
  );
  // oscillator.stop()
};

const updateGain = function () {
  myAudio.resume();
  let sliderVal = parseFloat(gainControl.value);
  document.getElementById("gainDisplay").innerText = `${sliderVal} dBFS`;
  let linAmp = 10 ** (sliderVal / 20);
  gainNode.gain.setValueAtTime(linAmp, myAudio.currentTime);
};

const updateAttack = function () {
  let sliderVal = parseFloat(attackControl.value);
  document.getElementById("attackDisplay").innerText = `${sliderVal} ms`;
};

const updateRelease = function () {
  let sliderVal = parseFloat(releaseControl.value);
  document.getElementById("releaseDisplay").innerText = `${sliderVal} ms`;
};

// Add an event listener for the 'change' event on the input devices dropdown.
// This allows the script to react when the user selects a different MIDI input device.
dropInsIO.addEventListener("change", function () {
  // Before changing the input device, remove any existing event listeners
  // to prevent them from being called after the device has been changed.
  if (myInput.hasListener("noteon")) {
    myInput.removeListener("noteon");
  }
  if (myInput.hasListener("noteoff")) {
    myInput.removeListener("noteoff");
  }

  // Change the input device based on the user's selection in the dropdown.
  myInput = WebMidi.inputs[dropInsIO.value];

  // After changing the input device, add new listeners for 'noteon' and 'noteoff' events.
  // These listeners will handle MIDI note on (key press) and note off (key release) messages.
  myInput.addListener("noteon", function (someMIDI) {
    // When a note on event is received, send a note on message to the output device.
    // This can trigger a sound or action on the MIDI output device.
    let freq = 440 * 2 ** ((someMIDI.note.number - 69) / 12);
    oscillator.frequency.setValueAtTime(freq, myAudio.currentTime);
    let waveform = someMIDI.note.rawattack > 64 ? "square" : "since";
    oscillator.type = waveform;
    startTone();
  });

  myInput.addListener("noteoff", function (someMIDI) {
    // Similarly, when a note off event is received, send a note off message to the output device.
    // This signals the end of a note being played.
    console.log("noteOFF");
    stopTone();
  });
});

startButton.addEventListener("click", startTone);
stopButton.addEventListener("click", stopTone);
gainControl.addEventListener("input", updateGain);
attackControl.addEventListener("input", updateAttack);
releaseControl.addEventListener("input", updateRelease);
