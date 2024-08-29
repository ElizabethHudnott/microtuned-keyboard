import AbstractNote from './abstract-synth.js';
import {TIME_CONSTANTS} from './audio-common.js';

const amplifiers = [];
let attackDuration = 0.03;
let releaseDuration = 0.05;

class Partial {
	/**
	 * @param {number} multiple An integer.
	 */
	constructor(ratio, multiple, maxVolume = 1) {
		this.ratio = Math.abs(ratio);
		this.multiple = Math.abs(multiple);
		this.maxVolume = maxVolume;
		this.polarity = Math.sign(ratio) * Math.sign(multiple);
	}
}

class PartialSet {
	constructor(ratio, amplitudes) {
		this.ratio = ratio;
		const numFrequencies = amplitudes.length;
		const cosineTerms = new Array(numFrequencies);
		cosineTerms.fill(0);
		this.wave = new PeriodicWave(audioContext, {real: cosineTerms, imag: amplitudes});
	}
}

export default class OrganNote extends AbstractNote {

	static #drawbarDefinitions;
	// A list of lists of partial sets.
	static #waves = [];
	static #currentWaveNumber = 0;

	static setDrawbars(presetNumber, positions) {
		const numDrawbars = positions.length;
		// Maps a ratio to the amplitudes of integer frequency multiples of that ratio.
		const partialMap = new Map();
		for (let i = 0; i < numDrawbars; i++) {
			const volume = positions[i];
			if (volume === 0) {
				continue;
			}
			const drawbar = OrganNote.#drawbarDefinitions[i];
			const ratio = drawbar.ratio;
			let amplitudes = partialMap.get(ratio);
			if (amplitudes === undefined) {
				amplitudes = [];
				partialMap.set(ratio, amplitudes);
			}
			const multiple = drawbar.multiple;
			for (let j = amplitudes.length; j < multiple; j++) {
				amplitudes[j] = 0;
			}
			amplitudes[multiple] = drawbar.polarity * drawbar.maxVolume * volume / 8;
		}
		const partialSets = [];
		for (let [ratio, amplitudes] of partialMap.entries()) {
			partialSets.push(new PartialSet(ratio, amplitudes));
		}
		OrganNote.#waves[presetNumber] = partialSets;
	}

	static init() {
		const subfifthRatio = 0.5 * musicKeyboard.nearestNote(1.5);
		const majorThirdRatio = musicKeyboard.nearestNote(1.25);
		OrganNote.#drawbarDefinitions = [
			new Partial(0.5, 1),
			new Partial(0.5, 2),
			new Partial(subfifthRatio, 2),	// 3 / 2
			new Partial(0.5, 4),
			new Partial(subfifthRatio, 4),	// 6 / 2
			new Partial(0.5, 8),
			new Partial(majorThirdRatio, 4),	// 10 / 2
			new Partial(subfifthRatio, 8),	// 12 / 2
			new Partial(0.5, 16),
		];
		OrganNote.setDrawbars(0, [8, 4, 3, 2, 1, 0, 1]); // [8, 4, 3, 2, 1, 1, 1]
	}

	static #createOscillators(frequency, destinationNode, time) {
		const partialSets = OrganNote.#waves[OrganNote.#currentWaveNumber];
		const oscillators = [];
		for (let partialSet of partialSets) {
			const oscillator = new OscillatorNode(audioContext, {frequency: 0, periodicWave: partialSet.wave});
			oscillator.start();
			oscillator.frequency.setValueAtTime(frequency * partialSet.ratio, time);
			oscillator.connect(destinationNode);
			oscillators.push(oscillator);
		}
		return oscillators;
	}

	constructor(noteNumber, frequency, velocity, time) {
		super();
		let amp = amplifiers[noteNumber];
		if (amp === undefined) {
			amp = new GainNode(audioContext, {gain: 0});
			amplifiers[noteNumber] = amp;
		}
		// TO DO add compressor
		amp.gain.setTargetAtTime(1/3, time, attackDuration / TIME_CONSTANTS);
		this.sources = OrganNote.#createOscillators(frequency, amp, time);
		this.outputs = [amp];
	}

	noteOff(offTime) {
		const endRelease = offTime + releaseDuration;
		const gain = this.outputs[0].gain;
		gain.setTargetAtTime(0, offTime, releaseDuration / TIME_CONSTANTS);
		this.stop(endRelease);
		return endRelease;
	}

}
