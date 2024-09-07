import {noteOn, noteOff} from './audio/output.js';
const VELOCITY_DEFAULT = 127;
const tunings = ['53edo'];

// Maps button numbers to ratios.
let tuning;
let sortedTuning;

function binarySearch(array, searchValue) {
	let lowerIndex = 0;
	let upperIndex = array.length - 1;
	let midIndex = Math.trunc(0.5 * upperIndex);
	let midValue = array[midIndex];
	while (lowerIndex < upperIndex - 1 && midValue !== searchValue) {
		if (midValue > searchValue) {
			upperIndex = midIndex;
		} else {
			lowerIndex = midIndex;
		}
		midIndex = Math.trunc(0.5 * (lowerIndex + upperIndex));
		midValue = array[midIndex];
	}
	if (midValue === searchValue) {
		return [searchValue, searchValue];
	}
	return [array[lowerIndex], array[upperIndex]];
}

window.musicKeyboard = {
	nearestRatio: function (ratio, fromNote = 0) {
		const numNotes = tuning.length;
		const dividend = sortedTuning[numNotes];

		let equivalenceIntervals = Math.floor(fromNote / numNotes);
		fromNote -= numNotes * equivalenceIntervals;
		ratio *= dividend ** equivalenceIntervals * tuning[fromNote];

		equivalenceIntervals = 0;
		while (ratio < 1) {
			ratio *= dividend;
			equivalenceIntervals--;
		}
		while (ratio > dividend) {
			ratio /= dividend;
			equivalenceIntervals++;
		}
		const [lower, upper] = binarySearch(sortedTuning, ratio);
		return (dividend ** equivalenceIntervals) * (ratio - lower < upper - ratio ? lower : upper);
	},

}

function pointerDown(event) {
	const keyNumber = parseInt(event.currentTarget.dataset.keyNumber);
	const tuningValue = tuning[keyNumber];
	noteOn(keyNumber, tuningValue, VELOCITY_DEFAULT);
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
		noteOn(keyNumber, tuningValue, VELOCITY_DEFAULT);
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
	sortedTuning = tuning.slice();
	sortedTuning.push(dividend);
	sortedTuning.sort((a, b) => a - b);
}

await loadTuning(tunings[0]);
