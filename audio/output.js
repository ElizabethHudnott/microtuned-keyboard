import OrganNote from './organ.js';
const generators = new Map();
generators.set('Organ', OrganNote);
let generator = OrganNote;

const audioContext = new AudioContext();
const destinations = [audioContext.destination];
const playing = [];

window.noteOn = function (noteNumber, tuningValue, velocity) {
	audioContext.resume();
	const frequency = 440 * tuningValue;
	const note = new generator(noteNumber, audioContext, frequency, velocity);
	note.connect(destinations);
	playing[noteNumber] = note;
}

window.noteOff = function (noteNumber) {
	playing[noteNumber].noteOff();
}
