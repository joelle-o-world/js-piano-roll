// REQUIRES ARE AT THE BOTTOM

/* PianoRoll:
    stores an array of PianoRoll.Note`s with attached time, duration and sound values
    The main class for storing musical information
*/


function PianoRoll(model, stepD) {
  this.notes = new Array();
  this._d = undefined;
  this.sorted = true;
  this.label;
  if(model != undefined) {
    if(model.constructor == String)
      model = PianoRoll.fromSteps(model, stepD)

    if(model.isPianoRoll) {
        this._d = model._d;
        this.sorted = model.sorted;
        this.label = duplicate(model.label);
        this.notes = duplicate(model.notes);
        if(model.instrument)
          this.instrument = duplicate(model.instrument)
    }
  }
}
module.exports = PianoRoll; // must come before requires!

PianoRoll.Note = require("./Note.js")
require("./manipulations.js")(PianoRoll)
require("./measurements.js")(PianoRoll)
//require("./saveMidiFile.js")(PianoRoll)

PianoRoll.prototype.isPianoRoll = true;
PianoRoll.prototype.isPianoRoll = true;

PianoRoll.prototype.quick = function(d) {
    d = d || 1;
    for(var i=1; i<arguments.length; i++) {
        var note = new PianoRoll.Note();
        note.sound = arguments[i];
        note.d = d;
        note.t = this.d;
        this.d += d;
        this.notes.push(note);
    }
}
PianoRoll.fromTs = function(times, sound, d) {
  sound = sound || true;
  times = times.sort();
  var track = new PianoRoll();
  for(var i in times) {
    var note = new PianoRoll.Note();
    note.sound = duplicate(sound);
    note.d = d;
    note.t = times[i];
    track.notes.push(note);
  }
  return track;
}
PianoRoll.fromSteps = function(steps, dStep) {
  if(steps.constructor == String) {
    steps = steps.split(" ")
  }
  dStep = dStep || 1
  var track = new PianoRoll()
  var currentNote
  for(var i=0; i<steps.length; i++) {
    var sound = steps[i]
    if(!sound || sound == ".")
      continue
    if(sound.constructor == String) {
      /*if(sound[0] == "_")
        sound = new Arp.Q(sound.slice(1))
      else */
      if(sound.match(/^[\d.]*$/))
        sound = parseFloat(sound)
    }

    var t = i * dStep
    if(steps[i]) {
      if(currentNote) {
        currentNote.d = t-currentNote.t
        track.notes.push(currentNote)
      }
      currentNote = new PianoRoll.Note()
      currentNote.t = t
      currentNote.sound = sound
    }
  }
  if(currentNote) {
    currentNote.d = steps.length * dStep - currentNote.t
    track.notes.push(currentNote)
  }
  track.d = dStep * steps.length

  return track
}





PianoRoll.prototype.__defineGetter__("smallestPulse", function() {
  var ts = this.Ts
  try {
    return gcd(ts)
  } catch(e) {
    console.log("couldn't find smallest pulse")
    return null
  }
})


PianoRoll.prototype.mapSounds = function(funcOrObj) {
  // UNTESTED!!
  var sounds = this.sounds;
  if(typeof funcOrObj == "function") {
    for(var i in sounds) {
      sounds[i] = funcOrObj(sounds[i]) || sounds[i];
    }
  } else if(typeof funcOrObj == "object") {
    for(var i in sounds) {
      sounds[i] = funcOrObj[sounds[i]] || sounds[i];
    }
  }
  var newTrack = new PianoRoll(this);
  newTrack.sounds = sounds;
  return newTrack;
}
PianoRoll.prototype.mapSoundsToSelf = function(funcOrObj) {
  // UNTESTED!!
  var sounds = this.sounds;
  if(typeof funcOrObj == "function") {
    for(var i in sounds) {
      sounds[i] = funcOrObj(sounds[i]) || sounds[i];
    }
  } else if(typeof funcOrObj == "object") {
    for(var i in sounds) {
      sounds[i] = funcOrObj[sounds[i]] || sounds[i];
    }
  }
  this.sounds = sounds;
  return this;
}


PianoRoll.prototype.soundsAtT = function(t) {
  var sounding = this.select(t)
  var sound = []
  for(var i in sounding.notes)
      sound = sound.concat(sounding.notes[i].sound)

  return sound
}
PianoRoll.prototype.soundAtT = function(t) {
    var sounding = this.select(t);
    var sound = [];
    for(var i in sounding.notes)
        sound = sound.concat(sounding.notes[i].sound)

    return sound.length<=1 ? sound[0] : sound;
}
PianoRoll.prototype.sound = function(t) {
    for(var i=0; i<this.notes.length; i++) {
        if(this.notes[i].t > t) {
            return i > 0 ? this.notes[i-1].sound : false;
        }
    }
    return this.notes.length ? this.notes[this.notes.length-1].sound : false;
}
PianoRoll.prototype.__defineGetter__("firstSound", function() {
    if(this.notes[0])
        return this.notes[0].sound;
    else
        return false;
});
PianoRoll.prototype.__defineGetter__("lastSound", function() {
    if(this.notes.length)
        return this.notes[this.notes.length-1];
    else
        return false;
});
PianoRoll.prototype.__defineGetter__("lastNote", function() {
  if(this.notes.length)
    return this.notes[this.notes.length-1]
  else
    return false
})
PianoRoll.prototype.__defineGetter__("firstNote", function() {
  if(this.notes.length)
    return this.notes[0]
  else
    return false
})
PianoRoll.prototype.__defineGetter__("firstP", function() {
    for(var i in this.notes) {
        if(this.notes[i].sound.constructor == Number) {
            return this.notes[i].sound;
        }
        if(this.notes[i].sound.constructor == Array) {
            for(var j in this.notes[i].sound) {
                if(this.notes[i].sound[j].constructor == Number)
                    return this.notes[i].sound[j];
            }
        }
    }
    return false;
});
PianoRoll.prototype.__defineGetter__("lastP", function() {
    for(var i=this.notes.length-1; i >= 0; i--) {
        if(this.notes[i].sound.constructor == Number)
            return this.notes[i].sound;
        if(this.notes[i].sound.constructor == Array) {
            for(var j=this.notes[i].sound.length-1; j>=0; j--) {
                if(this.notes[i].sound[j].constructor == Number)
                    return this.notes[i].sound[j];
            }
        }
    }
    return false;
});

/*PianoRoll.prototype.arpPoke = function(n, harmony, gamut, subD) {
    this.qPoke(n, gamut, subD);
    Arp(this, harmony);
    return this;
}
PianoRoll.prototype.qPoke = function(n, gamut, subD) {
    subD = subD || 1;
    gamut = gamut || [">s1", ">s-1", "<h0", "<h1", "<h-1", "<h2", "<h-2"];

    var q = new Arp.Q(gamut[Math.floor(Math.random()*gamut.length)]);
    var t = Math.floor(Math.random()*this.d/subD)*subD;

    var note = new PianoRoll.Note();
    note.sound = q;
    note.t = 0;
    note.d = t+subD<=this.d ? subD : this.d-t;

    this.overwrite(note, t);

    if(n > 1) return this.qPoke(n-1, gamut, subD);
    else return this;
}*/

PianoRoll.prototype.countAttacks = function(t0, t1) {
    t0 = t0 || 0;
    t1 = t1 || this.d;
    var n = 0;
    for(var i in this.notes)
        if(this.notes[i].t >= t0 && this.notes[i].t < t1)
            n++;
    return n;
}

PianoRoll.prototype.sortNotes = function() {
    this.notes = this.notes.sort(function(a,b) {
        return a.t - b.t;
    });
    this.sorted = true;
    return this;
}
PianoRoll.prototype.checkNotesAreSorted = function() {
    for(var i=1; i<this.notes.length; i++) {
        if(this.notes[i-1].t > this.notes[i].t) {
            console.log("Notes are not sorted!");
            console.log((i-1) + "/" + i, this.notes.length);
            this.sortNotes();
            //break;
        }
    }
}
PianoRoll.prototype.removeNonNumberNotes = function() {
  var newNotes = []
  var removedNotes = []
  for(var i in this.notes) {
    if(this.notes[i].sound && this.notes[i].sound.constructor == Number)
      newNotes.push(this.notes[i])
    else
      removedNotes.push(this.notes[i])
  }
  console.log("removed", (this.notes.length-newNotes.length), "non number notes:", removedNotes)
  this.notes = newNotes
  return removedNotes
}
PianoRoll.prototype.splitArraySounds = function() {
  var newNotes = []
  for(var i in this.notes) {
    if(this.notes[i].sound && this.notes[i].sound.constructor == Array) {
      for(var j in this.notes[i].sound) {
        var note = new PianoRoll.Note(this.notes[i])
        note.sound = this.notes[i].sound[j]
        newNotes.push( note )
      }
    } else {
      newNotes.push( this.notes[i] )
    }
  }
  var newTrack = new PianoRoll(this)
  newTrack.notes = newNotes
  return newTrack
}
PianoRoll.prototype.select = function(t1, t2) {
    if(t2 == undefined) {
        t2 = t1;
    }
    var selection = [];
    for(var i=0; i<this.notes.length; i++) {
        if(this.notes[i].t < t2 && this.notes[i].tOff > t1
        || this.notes[i].t == t1) {
            selection.push(this.notes[i]);
        }
    }

    var newTrack = new this.constructor();
    newTrack.notes = selection;
    newTrack.label = this.label + " selection";
    return newTrack;
}
PianoRoll.prototype.__defineGetter__("octaveProfile", function() {
    var op = {};
    for(var i in this.notes) {
      if(this.notes[i].sound.constructor == Number) {
        var pc = pitch.pc(this.notes[i].sound);
        op[pc] = true;
      } else if(this.notes[i].sound.constructor == Array) {
        for(var j in this.notes[i].sound) {
          if(this.notes[i].sound[j].constructor == Number) {
            var pc = pitch.pc(this.notes[i].sound[j]);
            op[pc] = true;
          }
        }
      }
    }
    var op2 = [];
    for(var i in op) {
        op2.push(parseFloat(i));
    }
    return op2;
});
PianoRoll.prototype.__defineGetter__("octaveProfileStatistics", function() {
  var stats = {}
  for(var i in this.notes) {
    var noteOp = this.notes[i].octaveProfileStatistics
    for(var p in noteOp)
      stats[p] = (stats[p] || 0) + noteOp[p] * this.notes[i].d
  }
  return stats
})
PianoRoll.prototype.__defineGetter__("bass", function() {
    // returns lowest pitch in the track as a midi number
    var winner = undefined;
    for(var i in this.notes) {
        var bass = this.notes[i].bass;
        if(bass != undefined) {
            if(winner == undefined || bass < winner) {
                winner = bass;
            }
        }
    }
    return winner;
})



PianoRoll.prototype.randomNote = function() {
  if(this.notes.length == 0)
    return null
  return this.notes[Math.floor(Math.random()*this.notes.length)]
}




var duplicate = require("./duplicate.js");
var pitch = require("./pitch.js");
//var Arp = require("../Arp.js");
const gcd = require("compute-gcd")
