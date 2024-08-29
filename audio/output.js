import OrganNote from './organ.js';
window.audioContext = new AudioContext();
const generators = new Map();
generators.set('Organ', OrganNote);

let generator = OrganNote;
const destinations = [audioContext.destination];
const playing = [];

function nextQuantum() {
	return audioContext.currentTime + 255 / audioContext.sampleRate;
}

function noteOn(noteNumber, tuningValue, velocity) {
	audioContext.resume();
	const frequency = 440 * tuningValue;
	const note = new generator(noteNumber, frequency, velocity, nextQuantum());
	note.connect(destinations);
	playing[noteNumber] = note;
}

function noteOff(noteNumber) {
	playing[noteNumber].noteOff(nextQuantum());
}

function initializeSynths() {
	for (let generator of generators.values()) {
		generator.init();
	}
}

export {
	initializeSynths,
	noteOn,
	noteOff,
}
