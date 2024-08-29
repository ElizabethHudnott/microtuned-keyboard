const ATTENUATION_BITS = 8;
const TIME_CONSTANTS = Math.log(1 << ATTENUATION_BITS);

function logToLinear(x) {
	if (x === 0) {
		return 0;
	}
	return 2 ** (-ATTENUATION_BITS * (1 - x));
}

export {
	TIME_CONSTANTS,
	logToLinear,
}
