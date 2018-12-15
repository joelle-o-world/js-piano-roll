var midiConverter = require("midi-converter");
var midiRef = require("./midiRef.js");
var PianoRoll = require("./PianoRoll.js");
var MeterTrack = require("./MeterTrack.js");
var Ensemble = require("./Ensemble.js");



exports.parseJSONMidiTrack = require("./parseJSONMidiTrack.js");
exports.parseJSONMidiFile = require("./parseJSONMidiFile.js");
exports.PianoRoll_to_JSONMidiTrack = require("./PianoRoll_to_JSONMidiTrack.js");
exports.PianoRoll_to_jsonMidiFile = require("./PianoRoll_to_JSONMidiFile.js");
exports.Ensemble_to_jsonMidiFile = require("./Ensemble_to_jsonMidiFile");


// file system functions
//exports.parseMidiFile = parseMidiFile;
//exports.PianoRoll_saveMidiFile = PianoRoll_saveMidiFile;
//exports.Ensemble_saveMidiFile = Ensemble_saveMidiFile;
