import OrganNote from './organ.js';
const generators = new Map();
generators.set('Organ', OrganNote);
let generator = OrganNote;
const playing = [];

const context = new AudioContext();

function nextQuantum() {
	return context.currentTime + 255 / context.sampleRate;
}

let lfoFrequency = 5;
let vibratoEnabled = false;
const lfo = new OscillatorNode(context, {frequency: 0});
lfo.start();
const destinations = [context.destination];

function noteOn(noteNumber, tuningValue, velocity) {
	context.resume();
	const frequency = 440 * tuningValue;
	const note = generator.factory(noteNumber, frequency, velocity, nextQuantum());
	note.connect(destinations);
	playing[noteNumber] = note;
}

function noteOff(noteNumber) {
	playing[noteNumber].noteOff(nextQuantum());
}

function enableVibrato(enabled, time) {
	if (enabled) {
		lfo.frequency.setValueAtTime(lfoFrequency, time);
	} else {
		lfo.frequency.setValueAtTime(0, time);
	}
	vibratoEnabled = enabled;
}

function setLFOFrequency(frequency, time) {
	if (vibratoEnabled) {
		lfo.frequency.setValueAtTime(frequency, time);
	}
	lfoFrequency = frequency;
}

window.audioOut = {
	context: context,
	enableVibrato: enableVibrato,
	setLFOFrequency: setLFOFrequency,
}

generator.activate(nextQuantum());

export {
	noteOn,
	noteOff,
}
