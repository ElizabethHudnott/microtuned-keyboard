export default class AbstractNote {

	connect(destinations) {
		for (let output of this.outputs) {
			for (let destination of destinations) {
				output.connect(destination);
			}
		}
	}

	stop(stopTime) {
		for (let source of this.sources) {
			source.stop(stopTime);
		}
	}

}
