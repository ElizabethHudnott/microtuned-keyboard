import AbstractNote from './abstract-synth.js';

export default class OrganNote extends AbstractNote {

	static maxAttack = 0.03;
	static maxRelease = 0.05;
	static #drawbarPositions = [8, 4, 3, 2, 1, 0, 1];
	static #drawbarTotal = 5.8096065460907;
	static #drawbarRatios = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8];
	static #notes = new Map();
	static #oscillators = new Map();

	static factory(noteNumber, frequency, velocity, time) {
		let note = OrganNote.#notes.get(noteNumber);
		if (note === undefined) {
			note = new OrganNote(noteNumber);
			OrganNote.#notes.set(noteNumber, note);
		}
		note.noteOn(time, velocity);
		return note;
	}

	constructor(noteNumber) {
		super();
		const drawbarAmps = [];
		for (let drawbarRatio of OrganNote.#drawbarRatios) {
			const ratio = musicKeyboard.nearestRatio(drawbarRatio, noteNumber);
			let oscillator = OrganNote.#oscillators.get(ratio);
			if (oscillator === undefined) {
				oscillator = new OscillatorNode(audioContext, {frequency: 220 * ratio});
				OrganNote.#oscillators.set(ratio, oscillator);
				oscillator.start();
			}
			const drawbarAmp = new GainNode(audioContext, {gain: 0});
			oscillator.connect(drawbarAmp);
			drawbarAmps.push(drawbarAmp);
		}

		this.sources = [];
		this.outputs = drawbarAmps;
	}

	noteOn(time, velocity) {
		const numDrawbars = OrganNote.#drawbarPositions.length;
		const attack = OrganNote.maxAttack * (128 - velocity) / 127;
		for (let i = 0; i < numDrawbars; i++) {
			const connectTime = time + Math.random() * attack;
			const level = OrganNote.#drawbarPositions[i] / (8 * OrganNote.#drawbarTotal);
			this.outputs[i].gain.setValueAtTime(level, connectTime);
		}
	}

	noteOff(time, velocity = 127) {
		const release = OrganNote.maxRelease * (128 - velocity) / 127;
		for (let drawbarAmp of this.outputs) {
			const disconnectTime = time + Math.random() * release;
			drawbarAmp.gain.setValueAtTime(0, disconnectTime);
		}
	}

}
