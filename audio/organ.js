import AbstractNote from './abstract-synth.js';

export default class OrganNote extends AbstractNote {
	constructor(noteNumber, audioContext, frequency, velocity) {
		super();
		const oscillator = new OscillatorNode(audioContext, {type: 'triangle', frequency: frequency});
		oscillator.start();
		this.sources = [oscillator];
		this.outputs = [oscillator];
	}

	noteOff() {
		super.noteCut();
	}

}
