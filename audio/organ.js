import AbstractNote from './abstract-synth.js';

const TIME_CONSTANTS = Math.log(256);
const amplifiers = [];
let attackDuration = 0.03;
let releaseDuration = 0.05;

export default class OrganNote extends AbstractNote {
	constructor(noteNumber, audioContext, frequency, velocity, time) {
		super();
		const oscillator = new OscillatorNode(audioContext, {type: 'triangle', frequency: frequency});
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
