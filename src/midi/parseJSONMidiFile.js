function parseJSONMidiFile(file, supressConsole) {
    var meterTrack = new MeterTrack();
    var result = new TrackGroup();
    var trackN = 0;
    for(var i in file.tracks) {
      var track = parseJSONMidiTrack(file.tracks[i], file.header, meterTrack, supressConsole);
      if(track.notes.length == 0) {
        if(!supressConsole)
          console.log("skipped track", i, "because it is empty")
        continue;
      }
      result.tracks[trackN] = track
      trackN++
    }
    result.tracks.meter = meterTrack;

    result.checkNotesAreSorted();
    return result;
}
module.exports = parseJSONMidiFile
