export default class AbstractNote {

	connect(destinations) {
		for (let output of this.outputs) {
			for (let destination of destinations) {
				output.connect(destination);
			}
		}
	}

	noteCut() {
		for (let source of this.sources) {
			source.stop()
		}
	}

}
