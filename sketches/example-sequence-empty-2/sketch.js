import { sendSequenceNextSignal } from "../../shared/sequenceRunner.js"

let finished = false

window.setup = function () {
	createCanvas(windowWidth, windowHeight)
}
window.mouseClicked = function () {
	finished = true;
}

window.draw = function () {

	background(0, 255, 0);

	if (finished) {
		sendSequenceNextSignal(); // finish sketch
		noLoop();
	}

}
