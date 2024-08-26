const TIME_CONSTANTS = Math.log(256);

function decibelReductionToAmplitude(decibels) {
	return 10 ** (-decibels / 20);
}

export {
	TIME_CONSTANTS,
	decibelReductionToAmplitude
}
