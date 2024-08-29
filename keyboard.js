import {initializeSynths, noteOn, noteOff} from './audio/output.js';
const tunings = ['53edo'];

let tuning;

function binarySearch(array, searchValue) {
	let lowerIndex = 0;
	let upperIndex = array.length - 1;
	let midIndex = Math.trunc(0.5 * upperIndex);
	let midValue = array[midIndex];
	while (lowerIndex < upperIndex && midValue !== searchValue) {
		if (midValue > searchValue) {
			upperIndex = midIndex - 1;
		} else {
			lowerIndex = midIndex + 1;
		}
		midIndex = Math.trunc(0.5 * (lowerIndex + upperIndex));
		midValue = array[midIndex];
	}
	if (midValue === searchValue) {
		return [searchValue, searchValue];
	}
	return [array[upperIndex], array[lowerIndex]];
}

window.musicKeyboard = {
	nearestNote(ratio) {
		const [lower, upper] = binarySearch(tuning, ratio);
		return ratio - lower <= upper - ratio ? lower : upper;
	}
}

function pointerDown(event) {
	const keyNumber = parseInt(event.currentTarget.dataset.keyNumber);
	const tuningValue = tuning[keyNumber];
	noteOn(keyNumber, tuningValue, 127);
}

function pointerUp(event) {
	const keyNumber = parseInt(event.currentTarget.dataset.keyNumber);
	noteOff(keyNumber);
}

function pointerLeave(event) {
	if (event.buttons > 0) {
		const keyNumber = parseInt(event.currentTarget.dataset.keyNumber);
		noteOff(keyNumber);
	}
}

function pointerEnter(event) {
	if (event.buttons > 0) {
		const keyNumber = parseInt(event.currentTarget.dataset.keyNumber);
		const tuningValue = tuning[keyNumber];
		noteOn(keyNumber, tuningValue, 127);
	}
}

async function loadTuning(name) {
	const url = 'tunings/' + name + '.json';
	const response = await fetch(url);
	const data = await response.json();
	const dividend = data.dividend || 2;
	const divisions = data.divisions;
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
			button.addEventListener('pointerleave', pointerLeave);
			button.addEventListener('pointerenter', pointerEnter);
			let ratio = dividend ** (noteTuning / divisions);
			tuning[buttonNum] = ratio;
			button.innerHTML = noteTuning;
			rowContainer.appendChild(button);
			buttonNum++;
		}
		keyboard.appendChild(rowContainer);
	}
}

await loadTuning(tunings[0]);
initializeSynths();
