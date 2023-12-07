import { runSequence } from "./shared/sequenceRunner.js";

const emptySequence = [
    "sketches/example-sequence-empty",
    "sketches/example-sequence-empty",
]

const exampleSequence = [
    "sketches/day-1",
    "sketches/day-2",
    "sketches/day-3",
    "sketches/day-4",
]

runSequence(exampleSequence)