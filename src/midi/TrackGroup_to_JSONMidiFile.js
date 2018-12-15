function TrackGroup_to_JSONMidiFile(group){
    group = new TrackGroup(group);
    for(var i in group.tracks) {
        if(!group.tracks[i].isAPianoRoll) {
            group.tracks[i] = group.tracks[i].toPianoRoll();
        }
    }

    var header = {
        "formatType": 0,
        "trackCount": group.tracks.length,
        "ticksPerBeat": 128
    }

    var tracks = [];
    for(var i in group.tracks) {
        var midiTrack = PianoRoll_to_JSONMidiTrack(group.tracks[i], header);
        tracks.push(midiTrack);
    }
    return {
        "header": header,
        "tracks": tracks
    }
}
module.exports = TrackGroup_to_JSONMidiFile
