import AbstractNote from './abstract-synth.js';

export default class OrganNote extends AbstractNote {

	static maxAttack = 0.03;
	static maxRelease = 0.05;
	static #drawbarPositions = [8, 4, 3, 2, 1, 0, 1];
	static #drawbarMax = 7;
	static #drawbarRatios;
	static #notes = new Map();
	static #oscillators = new Map();

	static {
		const fifth = 2 ** (7 / 12);
		const third = 2 ** (4 / 12);
		OrganNote.#drawbarRatios = [
			0.5,			// 1/2
			1,				// 2/2
			fifth,		// 3/2
			2,				// 4/2
			2 * fifth,	// 6/2
			4,				// 8/2
			4 * third,	// 10/2
			4 * fifth,	// 12/2
			8,				// 16/2
		];
	}

	static factory(noteNumber, frequency, velocity, time) {
		let note = OrganNote.#notes.get(noteNumber);
		if (note === undefined) {
			note = new OrganNote(noteNumber, time);
			OrganNote.#notes.set(noteNumber, note);
		}
		note.noteOn(time, velocity);
		return note;
	}

	constructor(noteNumber, time) {
		super();
		const drawbarAmps = [];
		for (let drawbarRatio of OrganNote.#drawbarRatios) {
			const ratio = musicKeyboard.nearestRatio(drawbarRatio, noteNumber);
			let oscillator = OrganNote.#oscillators.get(ratio);
			if (oscillator === undefined) {
				oscillator = new OscillatorNode(audioContext, {frequency: 220 * ratio});
				OrganNote.#oscillators.set(ratio, oscillator);
				oscillator.start(time);
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
		let lastOn = 0;
		for (let i = 0; i < numDrawbars; i++) {
			const latestOn = i / (numDrawbars - 1) * attack;
			const delay = Math.random() * (latestOn - lastOn);
			const connectTime = time + lastOn + delay;
			const drawbarNumber = numDrawbars - i - 1;
			const level = OrganNote.#drawbarPositions[drawbarNumber] / (8 * OrganNote.#drawbarMax);
			const gain = this.outputs[drawbarNumber].gain;
			gain.cancelScheduledValues(connectTime);
			gain.setValueAtTime(level, connectTime);
			lastOn += delay;
		}
	}

	noteOff(time, velocity = 127) {
		for (let output of this.outputs) {
			output.gain.cancelScheduledValues(time);
		}
		const numDrawbars = OrganNote.#drawbarPositions.length;
		const release = OrganNote.maxRelease * (128 - velocity) / 127;
		let lastOff = 0;
		for (let i = 0; i < numDrawbars; i++) {
			const latestOff = i / (numDrawbars - 1) * release;
			const delay = Math.random() * (latestOff - lastOff);
			const disconnectTime = time + lastOff + delay;
			const drawbarNumber = numDrawbars - i - 1;
			const gain = this.outputs[drawbarNumber].gain;
			gain.setValueAtTime(0, disconnectTime);
			lastOff += delay;
		}
	}

}
