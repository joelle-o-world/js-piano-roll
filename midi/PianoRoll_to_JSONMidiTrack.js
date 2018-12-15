function PianoRoll_to_jsonMidiTrack(track, header) {
    track = new PianoRoll(track);
    var events = [];
    for(var i in track.notes) {
        var noteOn = {
            "absoluteTime":Math.round(track.notes[i].t * header.ticksPerBeat/4),
            "noteNumber": track.notes[i].sound,
            "velocity": 60,
            "channel": 0,
            "type": "channel",
            "subtype": "noteOn"
        }
        events.push(noteOn);

        var noteOff = {
            "absoluteTime":Math.round(track.notes[i].tOff * header.ticksPerBeat/4),
            "noteNumber": track.notes[i].sound,
            "velocity": 60,
            "type": "channel",
            "subtype": "noteOff"
        }
        if(track.notes[i].d == undefined)
            noteOff.absoluteTime = noteOn.absoluteTime + 1;
        events.push(noteOff);
    }
    events = events.sort(function(a, b) {
        return a.absoluteTime - b.absoluteTime;
    });

    var lastT = 0;
    for(var i in events) {
        events[i].deltaTime = events[i].absoluteTime-lastT;
        lastT = events[i].absoluteTime;
        delete events[i].absoluteTime;
    }
    events.push({
        "deltaTime": 0,
        "type": "meta",
        "subtype": "endOfTrack"
    })
    return events;
}
