import OrganNote from './organ.js';
const generators = new Map();
generators.set('Organ', OrganNote);
let generator = OrganNote;

const audioContext = new AudioContext();
const destinations = [audioContext.destination];
const playing = [];

function nextQuantum() {
	return audioContext.currentTime + 255 / audioContext.sampleRate;
}

function noteOn(noteNumber, tuningValue, velocity) {
	audioContext.resume();
	const frequency = 440 * tuningValue;
	const note = new generator(noteNumber, audioContext, frequency, velocity, nextQuantum());
	note.connect(destinations);
	playing[noteNumber] = note;
}

function noteOff(noteNumber) {
	playing[noteNumber].noteOff(nextQuantum());
}

export {
	noteOn,
	noteOff,
}
