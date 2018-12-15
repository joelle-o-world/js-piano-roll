const utility = require("../utility.js")


const possibleNoteProperties = [
  "t",
  "d",
  "sound",
  "percsetIndex",
]

Note = function(model, t, d) {
    this.sound = false;
    this.t = undefined;
    this.d = undefined;

    if(model != undefined && model.isAPianoRollNote) {
      if(model.bpm)
        this.bpm = model.bpm

      for(var i in possibleNoteProperties) {
        var prop = possibleNoteProperties[i]
        if(model[prop] != undefined) {
          this[prop] = utility.duplicate(model[prop])
        }
      }
    } else if(model != undefined) {
      this.sound = utility.duplicate(model)
      this.t = t
      this.d = d
    }
}

module.exports = Note


Note.prototype.isAPianoRollNote = true;
Note.prototype.isPianoRollNote = true
Note.prototype.__defineGetter__("tOff", function() {
    if(this.t == undefined) {
        return undefined;
    }
    if(this.d == undefined) {
        return undefined; //this.t;
    }
    return this.t + this.d;
});
Note.prototype.__defineSetter__("tOff", function(tOff) {
    this.d = tOff-this.t;
    if(this.d == NaN) {
        this.d = undefined;
    }
});
Note.prototype.__defineGetter__("bass", function() {
    // return lowest pitch as midi number (or undefined)
    if(this.sound != undefined) {
        if(this.sound.constructor == Number) {
            return this.sound;
        }
        if(this.sound.constructor == Array) {
            var winner = undefined;
            for(var i in this.sound) {
              if(
                typeof this.sound[i] == "number" &&
                (winner == undefined || this.sound[i] < winner)
              )
                winner = this.sound[i]
            }
            return winner;
        }
    }
    return ;
});
Note.prototype.__defineGetter__("p", function() {
  if(this.sound == undefined)
    return null
  if(this.sound.constructor == Number)
    return this.sound
  if(this.sound.constructor == Array) {
    var winner = undefined;
    for(var i in this.sound) {
      if(typeof this.sound[i] == "number")
        return this.sound[i]
    }
  }
})
Note.prototype.transpose = function(dP) {
  dP = dP || 0
  if(this.sound == undefined)
    return this
  if(this.sound.constructor == Number)
    this.sound += dP
  if(this.sound.constructor == Array)
    for(var i in this.sound) {
      if(this.sound[i] && this.sound[i].constructor == Number)
        this.sound[i] += dP
    }
  return this
}

Note.prototype.__defineGetter__("octaveProfileStatistics", function() {
  var stats = {}
  if(this.sound) {
    if(this.sound.constructor == Array) {
      for(var i in this.sound) {
        var p = pitch.pc(this.sound[i])
        if(p && p.construtor == Number)
          stats[p] = (stats[p] || 0) + 1
        else
          console.log("Problem!! (Note.prototype.octaveProfileStatistics)")
      }
    }
    else if(this.sound.constructor == Number) {
      var p = pitch.pc(this.sound)
      stats[p] = (stats[p] || 0) + 1
    }
    else if(this.sound.isHarmonySymbol) {
      var op = this.sound.octaveProfile
      for(var i in op)
        stats[op[i]] = (stats[op[i]] || 0) + 1
    }
  }
  return stats
})
