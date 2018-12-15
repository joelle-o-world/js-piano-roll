
var parseSound = require("../parseSound.js")

module.exports = (PointTrack) => {


  PointTrack.prototype.__defineGetter__("d", function() {
      if(this._d) {
          return this._d;
      }
      var winner = 0;
      for(var i in this.notes) {
          if(this.notes[i].tOff > winner) {
              winner = this.notes[i].tOff;
          }
      }
      return winner;
  })
  PointTrack.prototype.__defineSetter__("d", function(d) {
      this._d = d;
  })

  PointTrack.prototype.__defineGetter__("dInSeconds", function() {
    if(!isNaN(this.bpm) && !isNaN(this.d))
      return (15/this.bpm) * this.d
  })

  PointTrack.prototype.__defineGetter__("monophonic", function() {
    // are there any sounds which are chords?
    for(var i in this.notes) {
      var sound = this.notes[i].sound
      if(sound && sound.constructor == Array)
        return false
    }

    // do any notes which overlap?
    for(var i=0; i+1<this.notes.length; i++) {
      var note = this.notes[i]
      var nextNote = this.notes[i+1]
      if(note.t == nextNote.t)
        return false
      if(nextNote.t < note.tOff)
        return false
    }

    // otherwise it is monophonic
    return true
  })
  PointTrack.prototype.__defineGetter__("polyphonic", function() {
    return !this.monophonic
  })

  PointTrack.prototype.__defineGetter__("gamut", function() {
    // list of unique sounds in the track
    return this.sounds.filter(function(value, i, self) {
      return self.indexOf(value) == i;
    }).sort()
  })


  PointTrack.prototype.lowestUnusedSound = function(sound) {
    // UNTESTED!!
    var gamut = this.gamut;
    return parseSound.lowestUnusedSound(gamut, sound);
  }

  PointTrack.prototype.__defineGetter__("sounds", function() {
      // list all sounds in the track, including duplicates. Used for iterative processing
      var list = [];
      for(var i in this.notes) {
          if(this.notes[i].sound == false || this.notes[i].sound == undefined)
              continue;
          if(this.notes[i].sound.constructor == Array) {
              for(var j in this.notes[i].sound)
                  list.push( this.notes[i].sound[j] );
          } else
              list.push( this.notes[i].sound );
      }
      return list;
  });
  PointTrack.prototype.__defineSetter__("sounds", function(list) {
      list = list.slice();
      for(var i in this.notes) {
          if(this.notes[i].sound == false || this.notes[i].sound == undefined)
              continue;
          if(this.notes[i].sound.constructor == Array) {
              this.notes[i].sound = this.notes[i].sound.slice();
              for(var j in this.notes[i].sound)
                  this.notes[i].sound[j] = list.shift();
          } else
              this.notes[i].sound = list.shift();
      }
  })
  PointTrack.prototype.__defineGetter__("pitches", function() {
    var sounds = this.sounds
    return sounds.filter(function(sound) {
      return (sound && typeof sound == "number")
    })
  })
  PointTrack.prototype.__defineGetter__("averagePitch", function() {
    var sounds = this.pitches
    var sum = 0
    for(var i in sounds)
      sum += sounds[i]

    return sum/sounds.length
  })
  PointTrack.prototype.__defineGetter__("Ts", function() {
    var Ts = [];
    for(var i in this.notes)
      Ts.push(this.notes[i].t);

    return Ts;
  })
  PointTrack.prototype.__defineSetter__("Ts", function(Ts) {
    for(var i in Ts)
      this.notes[i].t = Ts[i];
  })
}
