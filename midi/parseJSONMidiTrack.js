function parseJSONMidiTrack(events, header, meterTrack, supressConsole) {
    if(!meterTrack)
        meterTrack = new MeterTrack();

    var t = 0;
    var hangingNotes = {};
    var newTrack = new PianoRoll();
    for(var i in events) {
        var event = events[i];
        t += event.deltaTime/header.ticksPerBeat * 4;
        if(event.type == "meta") {
            if(event.subtype == "endOfTrack") {
                break;
            } else if(event.subtype == "trackName") {
                newTrack.label = event.text;
                continue;
            } else if(event.subtype == "setTempo") {
                // event.microsecondsPerBeat
                var note = new PianoRoll.Note();
                note.t = t;
                note.bpm = 60000000/event.microsecondsPerBeat;
                meterTrack.tracks.tempo.mix(note);
            } else {
                if(!supressConsole)
                  console.log("unknown midi meta event subtype", event.subtype, ":\n", event);
                continue;
            }
        } else if(event.type == "channel") {
            if(event.subtype == "noteOn") {
                var newNote = new PianoRoll.Note();
                newNote.t = t;
                newNote.sound = event.noteNumber;
                hangingNotes[newNote.sound] = newNote;
                newTrack.notes.push(newNote);
            } else if(event.subtype == "noteOff") {
                if(hangingNotes[event.noteNumber]) {
                    hangingNotes[event.noteNumber].tOff = t;
                    hangingNotes[event.noteNumber] = undefined;
                }
            } else if(event.subtype == "programChange") {
                if(newTrack.instrument) {
                    console.log( "instrument assignment conflict. midi track contains multiple program changes" );
                }
                newTrack.instrument = midiRef.programNames[event.programNumber];
            } else {
              if(!supressConsole)
                console.log("unknown midi event subtype", event.subtype, ":\n", event);
            }
        }
    }
    return newTrack;
}

module.exports = parseJSONMidiTrack
