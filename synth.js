// Create our Audio Context
const siteAudio = new AudioContext();


/**
 * Container for ADSR values that are being used by the synth
 * @param {number} attack / updated by the updateattack function
 * @param {number} decay / updated by the updateattack function
 * @param {number} sustain / updated by the updatesustain function
 * @param {number} release / updated by the updaterelease funciton
 */
const adsr1 = {
  attack: 0.00,
  decay: 0.0,
  sustain: 0.0,
  release: 0.0,
};

/**
 * keeps track of the notes that actively being played so that the playkey and stopkey function
 */
const activeVoices = new Map();

// HTML objects for Oscilattor 1
const gainControl = document.getElementById("gainSlider")
const attackControl1 = document.getElementById("attackSlider1");
const decayControl1 = document.getElementById("decaySlider1");
const sustainControl1 = document.getElementById("sustainSlider1");
const releaseControl1 = document.getElementById("releaseSlider1");
const waveShape1 = document.getElementById("waveShape1");



// GETTING HTML FOR KEYS; JS AND HTML CODE MODIFIED BASED ON THIS CODE CODE FROM https://css-tricks.com/how-to-code-a-playable-synth-keyboard/
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

// establish oscillator and gain nodes + connecting them to site Audio
const osc1 = siteAudio.createOscillator();
const noteADSR1 = siteAudio.createGain();
const siteGain = siteAudio.createGain();
siteGain.connect(siteAudio.destination);
siteGain.gain.value = 0

// setting up a map to keep track of the pressed keys
const pressedNotes = new Map();
let clickedKey = "";

// function in charge of the sound
const playKey = function (key) {
  if (!keys[key]) {
    return;
  }

  // Check if the key is already pressed
  if (pressedNotes.has(key)) {
    return
    stopKey(key);
  }
  let keyGrab = keys[key];
  const osc1 = siteAudio.createOscillator();
  const noteADSR1 = siteAudio.createGain();
  noteADSR1.gain.setValueAtTime(0, siteAudio.currentTime);

  // making the oscillator and making sure it is connected when a key is played
  osc1.connect(noteADSR1);
  noteADSR1.connect(siteGain);
  console.log(key.note);

  activeVoices.set(keyGrab.note, { osc1, noteADSR1 });
  console.log("playKey", activeVoices);

// wave shape selecting function
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

  // starting the oscillator and updating the attack, sustain, and decay times
  osc1.start();
  noteADSR1.gain.linearRampToValueAtTime(
    1,
    siteAudio.currentTime + adsr1.attack
  );
  noteADSR1.gain.linearRampToValueAtTime(
    0,
    siteAudio.currentTime + adsr1.decay);
  noteADSR1.gain.linearRampToValueAtTime(
    adsr1.sustain,
    siteAudio.currentTime + adsr1.attack + adsr1.decay
  );
 
  console.log(adsr1.attack, adsr1.decay, adsr1.sustain, adsr1.release);

  siteAudio.resume();

  setWaveShape1();

  console.log(keyGrab)
};

setAttack1();
setDecay1();
setSustain1();
setRelease1();
setWaveShape1();

// responsible for stopping the key
const stopKey = function (key) {
  if (!keys[key]) {
    return;
  }

  let keyGrab = keys[key];
  console.log(activeVoices);
  const voice = activeVoices.get(keyGrab.note);
  console.log(voice);

if (voice && voice.noteADSR1){  
  voice.noteADSR1.gain.linearRampToValueAtTime(
    0,
    siteAudio.currentTime + adsr1.release
  );

  // remove pressed key
  keys[key].element.classList.remove("pressed");
  console.log(keys)
  // get the oscillator assosciated with the key
  const osc1 = pressedNotes.get(key);
  setTimeout(() => {
 

    voice.osc1.stop();
    voice.osc1.disconnect();
    activeVoices.delete(key);
    pressedNotes.delete(key);
    console.log(keyGrab)
  },
   (adsr1.release * 1000));

  // pressedNotes.delete(key);
  // activeVoices.delete(key)
}
};

// event listener for when a key is pressed, triggers the playkey function
document.addEventListener("keydown", (e) => {
  const eventKey = e.key.toUpperCase();
  const key = eventKey === ";" ? "semicolon" : eventKey;

  if (!key || pressedNotes.get(key)) {
    return;
  }
  playKey(key);
});

// event listener for when a key is release, triggers the stopkey function
document.addEventListener("keyup", (e) => {
  const eventKey = e.key.toUpperCase();
  const key = eventKey === ";" ? "semicolon" : eventKey;

  if (!key) {
    return;
  }
  stopKey(key);
});

// triggers playkey based on mouseclick
for (const [key, { element }] of Object.entries(keys)) {
  element.addEventListener("mousedown", () => {
    playKey(key);
    clickedKey = key;
  });
}

// triggers playkey based on mouse release
document.addEventListener("mouseup", () => {
  stopKey(clickedKey);
});


// updating display and values for ADSR
const updateAttackDisplay = function () {
  let sliderVal = parseFloat(attackControl1.value);
  adsr1.attack = sliderVal / 1000;
  // convert to seconds
  document.getElementById("attackDisplay1").innerText = `${sliderVal} ms`;
};

// update values and displays
const updateAttackValue = function (adsr1) {
  adsr1.attack = parseFloat(attackControl1.value / 1000);
};

const updateDecayDisplay = function () {
  let sliderVal = parseFloat(decayControl1.value);
  document.getElementById("decayDisplay1").innerText = `${sliderVal} ms`;
};

const updateDecayValue = function (adsr1) {
  adsr1.decay = parseFloat(decayControl1.value / 1000);
};

const updateSustainDisplay = function () {
  let sliderVal = parseFloat(sustainControl1.value);
  // convert to linear amplitude
  document.getElementById("sustainDisplay1").innerText = `${sliderVal} dB`;
};

const updateSustainValue = function (adsr1) {
  adsr1.sustain = parseFloat(Math.pow(10, sustainControl1.value / 20));
};

const updateReleaseDisplay = function () {
  let sliderVal = parseFloat(releaseControl1.value);
  document.getElementById("releaseDisplay1").innerText = `${sliderVal} ms`;
};

const updateReleaseValue = function (adsr1) {
  adsr1.release = parseFloat(releaseControl1.value / 1000);

};


// gain slider;

const updateGain = function() {
  siteAudio.resume()
  let sliderVal = parseFloat(gainControl.value)
  document.getElementById("gainDisplay").innerText = `${sliderVal} dBFS`
  let linAmp = 10**(sliderVal/20)
  console.log(sliderVal, linAmp)
  siteGain.gain.setValueAtTime(linAmp, siteAudio.currentTime);
  console.log(siteGain.gain.value)
}


// control event listeners
gainControl.addEventListener("input", updateGain);

attackControl1.addEventListener("input", updateAttackDisplay);
attackControl1.addEventListener("change", updateAttackValue);
decayControl1.addEventListener("input", updateDecayDisplay);
decayControl1.addEventListener("input", function() {
  updateDecayValue(adsr1);});

sustainControl1.addEventListener("input", updateSustainDisplay);
sustainControl1.addEventListener("input", function() {
  updateSustainValue(adsr1);});
releaseControl1.addEventListener("input", updateReleaseDisplay);
releaseControl1.addEventListener("input", function() {
  updateReleaseValue(adsr1);});

