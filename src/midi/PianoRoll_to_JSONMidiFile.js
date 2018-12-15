function PianoRoll_to_JSONMidiFile(oldTrack) {
    var header = {
        "formatType": 0,
        "trackCount": 1,
        "ticksPerBeat": 128
    }
    var tracks = [PianoRoll_to_JSONMidiTrack(oldTrack, header)];
    //[oldTrack.toJSONMidiTrack(header)];
    return {
        "header": header,
        "tracks": tracks
    }
}
module.exports = PianoRoll_to_JSONMidiFile
