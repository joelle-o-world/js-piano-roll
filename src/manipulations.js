

const duplicate = require("./duplicate.js")

module.exports = (PianoRoll) => {

  PianoRoll.prototype.stretch = function(scaleFactor) {
      if(!scaleFactor) return;
      if(this._d) this.d *= scaleFactor;
      for(var i in this.notes) {
          this.notes[i].t *= scaleFactor;
          if(this.notes[i].d) this.notes[i].d *= scaleFactor;
      }
      return this;
  }
  PianoRoll.prototype.stretchToFit = function(d) {
      var sf = d/this.d;
      return this.stretch(sf);
  }


  PianoRoll.prototype.cut = function(t1, t2, keepOverhangs) {
    var newTrack = new this.constructor(this).zerofy();
    newTrack.d = t2-t1;
    for(var i=0; i<this.notes.length; i++) {
      if(this.notes[i].t >= t1 && this.notes[i].t < t2) {
        var newNote = new PianoRoll.Note(this.notes[i]);
        if(newNote.tOff > t2) {
            newNote.tOff = t2;
        }
        newNote.t -= t1;
        newTrack.mix(newNote);
      } else if(keepOverhangs) {
        if(this.notes[i].t < t1 && this.notes[i].tOff > t1) {
            var newNote = new PianoRoll.Note(this.notes[i]);
            newNote.t = t1;
            newNote.tOff = this.notes[i].tOff;
            if(newNote.tOff > t2) {
                newNote.tOff = t2;
            }
            newTrack.mix(newNote);
        }
      }
    }
    return newTrack;
  }

  PianoRoll.prototype.transpose = function(semitones) {
    for(var i in this.notes) {
      this.notes[i].transpose(semitones)
    }
    return this
  }
  PianoRoll.prototype.rotate = function(timeshift) {
    var d = this.d
    timeshift %= d
    for(var i in this.notes) {
        this.notes[i].t += timeshift
        if(this.notes[i].t < 0)
            this.notes[i].t += d
        if(this.notes[i].t >= d)
            this.notes[i].t -= d
    }
    return this;
  }
  PianoRoll.prototype.loop = function(d) {
    var n = Math.ceil(d/this.d)
    var newTrack = new this.constructor()
    newTrack.d = 0
    for(var i=0; i<n; i++)
      newTrack.append(this)
    newTrack = newTrack.cut(0, d)
    newTrack.label = this.label + " (looped)"
    return newTrack
  }
  PianoRoll.prototype.loopN = function(n) {
    return this.loop(n * this.d)
  }

  PianoRoll.prototype.clear = function(t0, t1) {
    var newNotes = []
    for(var i=0; i<this.notes.length; i++) {
      var note = this.notes[i]

      if( note.t == t0 || (note.t > t0 && note.t < t1) )
        continue // remove notes starting within range

      if(note.t < t0 && note.tOff > t0)
        note.tOff = t0

      newNotes.push(note)
    }
    this.notes = newNotes
  }

  PianoRoll.prototype.blank = function(d) {
      this.notes = [];
      this._d = d;
      return this;
  }
  PianoRoll.prototype.zerofy = function() {
      this.notes = [];
      this._d = undefined;
      return this;
  }

  PianoRoll.prototype.emptyFill = function(d) {
      if(d == undefined) {
          this.d = undefined;
          d = this.d;
      }
      this.d = d;
  }

  PianoRoll.prototype.insertBlank = function(d, t) { // duration, time
      if(t == undefined) {
          t = 0;
      }
      var pre = this.cut(0, t);
      var nex = this.cut(t);
      for(var i=0; i<nex.notes.length; i++) {
          // mix would use splice, not necessary here.
          pre.notes.push(nex.notes[i]);
      }
      this.notes = pre.notes;
      return this;
  }
  PianoRoll.prototype.insert = function(material, t) {
      var d = material.d;
      this.insertBlank(d, t);
      this.mix(material, t);
      return this;
  }
  PianoRoll.prototype.overwrite = function(material, t) {
      var d = material.d;
      this.clear(t + (material.d || 0), t + d + (material.d || 0));
      this.mix(material, t);
      console.log(t, material.sound);
      return this;
  }
  PianoRoll.prototype.mix = function(material, t) {
      if(t == undefined) {
          t = 0;
      }
      if(material.isPianoRoll) {
          for(var i in material.notes) {
              this.mix(material.notes[i], t);
          }
      } else if(material.isPianoRollNote) {
          var newNote = new material.constructor(material);
          newNote.t += t;
          var i = 0;
          while(i<this.notes.length && this.notes[i].t <= newNote.t)
              i++;
          this.notes.splice(i, 0, newNote);
      } else if(material.isStepTrack) {
          //console.log("eeks experimental: mixing StepTrack into PianoRoll")
          this.mix(material.toPianoRoll(), t);
      }
      return this;
  }
  PianoRoll.prototype.append = function(material) {
      this.mix(material, this.d);
      if(this._d != undefined || material._d != undefined) this._d += material.d;
      return this;
  }
}
