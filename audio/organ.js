import AbstractNote from './abstract-synth.js';
import {TIME_CONSTANTS, decibelReductionToAmplitude} from './common.js';

const amplifiers = [];
let attackDuration = 0.03;
let releaseDuration = 0.05;

function fluteWave(gradient1, intercept1, gradient2, intercept2, numHarmonics, audioContext) {
	const maxIntercept = Math.max(intercept1, gradient2 + intercept2);
	const sineTerms = [0];
	for (let n = 1; n <= numHarmonics; n += 2) {
		const x = Math.log2(n);
		const db = gradient1 * x + intercept1;
		sineTerms[n] = decibelReductionToAmplitude(maxIntercept - db);
	}
	for (let n = 2; n <= numHarmonics; n += 2) {
		const x = Math.log2(n);
		const db = gradient2 * x + intercept2;
		sineTerms[n] = decibelReductionToAmplitude(maxIntercept - db);
	}
console.table(sineTerms);
	const cosineTerms = new Array(numHarmonics + 1);
	cosineTerms.fill(0);
	return new PeriodicWave(audioContext, {real: cosineTerms, imag: sineTerms});
}


export default class OrganNote extends AbstractNote {
	static initialize(audioContext) {
		let y1 = (234 - 46) / 3;
		let x2 = Math.log2(5);
		let y2 = (234 - 166) / 3;
		const m1 = (y2 - y1) / x2;
		const c1 = y1;
		y1 = y1 = (234 - 157.5) / 3;
		y2 = (234 - 187.5) / 3;
		const m2 = (y2 - y1) / (x2 - 1);
		const c2 = y2 - m2 * x2;
		OrganNote.fluteWave = fluteWave(m1, c1, m2, c2, 6, audioContext);
	}

	constructor(noteNumber, audioContext, frequency, velocity, time) {
		super();
		const oscillator = new OscillatorNode(
			audioContext,
			{frequency: frequency, periodWave: OrganNote.fluteWave}
		);
		oscillator.start();
		this.sources = [oscillator];
		let amp = amplifiers[noteNumber];
		if (amp === undefined) {
			amp = new GainNode(audioContext, {gain: 0});
			amplifiers[noteNumber] = amp;
		}
		amp.gain.setTargetAtTime(1, time, attackDuration / TIME_CONSTANTS);
		oscillator.connect(amp);
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
