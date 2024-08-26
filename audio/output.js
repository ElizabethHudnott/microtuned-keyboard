import OrganNote from './organ.js';
const audioContext = new AudioContext();
OrganNote.initialize(audioContext);
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
	const note = new generator(noteNumber, audioContext, 0.5 * frequency, velocity, nextQuantum());
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
