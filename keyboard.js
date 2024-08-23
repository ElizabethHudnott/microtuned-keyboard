const tunings = ['53edo'];

let tuning;

function pointerDown(event) {
	const keyNumber = parseInt(event.currentTarget.dataset.keyNumber);
	const tuningValue = tuning[keyNumber];
	noteOn(keyNumber, tuningValue, 127);
}

function pointerUp(event) {
	const keyNumber = parseInt(event.currentTarget.dataset.keyNumber);
	noteOff(keyNumber);
}

async function loadTuning(name) {
	const url = 'tunings/' + name + '.json';
	const response = await fetch(url);
	const data = await response.json();
	const dividend = data.dividend || 2;
	const divisions = data.divisions || 12;
	const rows = data.rows;
	const numRows = rows.length;
	const offsets = Array.isArray(data.offsets) ? data.offsets : [];
	let width = 0;
	for (let i = 0; i < numRows; i++) {
		const offset = offsets[i] || 0;
		width = Math.max(width, rows[i].length + offset);
	}

	const keyboard = document.getElementById('keyboard');
	keyboard.innerHTML = '';
	let buttonNum = 0;
	tuning = [];
	for (let j = 0; j < numRows; j++) {
		const row = rows[j];
		const rowContainer = document.createElement('div');
		rowContainer.classList.add('key-row');
		for (let i = 0; i < row.length; i++) {
			const noteTuning = row[i];
			const button = document.createElement('button');
			button.classList.add('key');
			button.dataset.keyNumber = buttonNum;
			button.addEventListener('pointerdown', pointerDown);
			button.addEventListener('pointerup', pointerUp);
			let ratio = dividend ** (noteTuning / divisions);
			tuning[buttonNum] = ratio;
			button.innerHTML = noteTuning;
			rowContainer.appendChild(button);
			buttonNum++;
		}
		keyboard.appendChild(rowContainer);
	}
}

loadTuning(tunings[0]);
