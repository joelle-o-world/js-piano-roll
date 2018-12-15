const fs = require("fs");


function parseMidiFile(filename, supressConsole) {
    var file = fs.readFileSync(filename, "binary");
    var json = midiConverter.midiToJSON(file);
    return parseJSONMidiFile(json, supressConsole);
}

PianoRoll_saveMidiFile = function(oldTrack, filename) {
    if(filename == undefined) {
        filename = this.label + ".mid";
    }
    var json = PianoRoll_to_jsonMidiFile(oldTrack);
    var file = midiConverter.jsonToMidi(json);
    fs.writeFileSync(filename, file, "binary");
    console.log("saved", filename);
}

Ensemble_saveMidiFile = function(group, filename) {
    if(!filename) throw "filename not provided";

    var jsonMidi = Ensemble_to_jsonMidiFile(group);
    var file = midiConverter.jsonToMidi(jsonMidi);
    fs.writeFileSync(filename, file, "binary");
    console.log("saved:", filename);
}
