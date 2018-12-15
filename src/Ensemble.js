function Ensemble(model) {
  this.tracks = new Object();

  if(model != undefined && model.isEnsemble) {
    for(var i in model.tracks) {
      this.tracks[i] = utility.duplicate(model.tracks[i])
    }
  }
}

module.exports = Ensemble;

var utility = require("./utility.js")
var StepTrack = require("./StepTrack.js");
var PointTrack = require("./PointTrack.js");
var midi = require("./midi.js");
var organise = require("../organise.js");
const Instrument = require("./Instrument.js")
const gcd = require("compute-gcd")

Ensemble.prototype.isEnsemble = true;

Ensemble.prototype.defaultTrackConstructor = PointTrack;

Ensemble.blank = function(d, n) {
  n = (n!=undefined) ? n : 1;
  d = (d!=undefined) ? d : 0;

  var group = new Ensemble()
  if(n.constructor == Number)
    for(var c=0; c<n; c++)
        group.tracks[c] = new group.defaultTrackConstructor().blank(d)
  else if(typeof n == "object") {
    for(var c in n) {
      group.tracks[c] = new group.defaultTrackConstructor().blank(d)
      group.tracks[c].instrument = new Instrument(n[c])
    }
  }
  return group;
}
Ensemble.blankGrid = function(nWidth, n, subD, sound) {
  nWidth = nWidth || 1
  n = n || 1
  subD = subD || 4
  sound = sound || false

  var d = nWidth * subD

  var group = Ensemble.blank(d, n)

  for(var c in group.tracks) {
    for(var t=0; t<d; t+=subD) {
      var note = new PointTrack.Note()
      note.t = t
      note.d = subD
      note.sound = utility.duplicate(sound)
      group.tracks[c].mix(note)
    }
  }
  return group
}


Ensemble.prototype.__defineGetter__("d", function() {
    var d = 0;
    for(var i in this.tracks) {
        if(this.tracks[i].d > d) {
            d = this.tracks[i].d;
        }
    }
    return d;
});
Ensemble.prototype.__defineGetter__("numberOfTracks", function() {
    return Object.keys(this.tracks).length;
})
Ensemble.prototype.emptyFill = function(d) {
    if(d == undefined) {
        d = this.d;
    }
    for(var i in this.tracks) {
        this.tracks[i].emptyFill(d);
    }
    return this;
}

Ensemble.prototype.stretch = function(sf) {
    for(var i in this.tracks) {
        this.tracks[i].stretch(sf);
    }
    return this;
}
Ensemble.prototype.stretchToFit = function(d) {
    var sf = d/this.d;
    this.stretch(sf);
    return this;
}

Ensemble.prototype.cut = function(from, to) {
    if(from == undefined) {
        from = 0;
    }
    if(to == undefined) {
        to = this.d;
    }
    var newGroup = new this.constructor();
    for(var i in this.tracks) {
        newGroup.tracks[i] = this.tracks[i].cut(from, to);
    }
    return newGroup;
}
Ensemble.prototype.overwrite = function(what, t, channel) {
    if(channel == undefined) {
        channel = 0;
    }
    if(t == undefined) {
        t = 0;
    }
    for(var i in what.tracks) {
        i = channelShift(i, channel);
        if(this.tracks[i] == undefined) {
            this.tracks[i] = new what.tracks[i].constructor();
        }
        this.tracks[i].overwrite(what.tracks[i], t);
    }
    return this;
}
Ensemble.prototype.mix = function(what, t, channel) {
    if(channel == undefined) {
        channel = 0;
    }
    if(t == undefined) {
        t = 0;
    }
    var d = this.d;
    for(var i in what.tracks) {
        i = Ensemble.channelShift(i, channel);
        if(this.tracks[i] == undefined) {
            this.tracks[i] = new what.tracks[i].constructor();
        }
        this.tracks[i].mix(what.tracks[i], t);
    }
    return this;
}
Ensemble.prototype.append = function(what) {
    this.emptyFill();
    var d = this.d;
    for(var i in what.tracks) {
        if(this.tracks[i] == undefined) {
            this.tracks[i] = new what.tracks[i].constructor().blank(d);
        }
        this.tracks[i].append(what.tracks[i]);
    }
    return this;
}
Ensemble.prototype.insertBlank = function(d, t) {
    if(d == undefined) {
        d = 1;
    }
    for(var i in this.tracks) {
        this.tracks[i].insertBlank(d);
    }
}
Ensemble.prototype.insert = function(what, t, channel) {
    if(t == undefined) {
        t = 0;
    }
    if(channel == undefined) {
        channel = 0;
    }
    var d = what.d;
    this.insertBlank(d);
    this.overwrite(what, t, channel);
}
Ensemble.prototype.blank = function(d, n) {
    n = (n!=undefined) ? n : (this.tracks.length || 1);
    d = (d!=undefined) ? d : 0;

    this.tracks = new Object();
    for(var i=0; i<n; i++)
        this.tracks[i] = new this.defaultTrackConstructor().blank(d);
    return this;
}
Ensemble.prototype.zerofy = function() {
    for(var i in this.tracks)
        this.tracks[i].zerofy();
    return this;
}
Ensemble.prototype.clear = function(t0, t1, except) {
    if(typeof except == "string" || typeof except == "number")
        except = [except];
    else if(except == undefined || except.constructor != Array)
        except = [];

    for(var i in this.tracks) {
        if(except.indexOf(i) != -1)
            continue;
        this.tracks[i].clear(t0, t1);
    }
}
Ensemble.prototype.loop = function(d) {
    this.emptyFill();
    if(d == undefined) {
        d = this.d*2;
    }

    for(var i in this.tracks) {
      this.tracks[i] = this.tracks[i].loop(d);
    }

    return this;
}
Ensemble.prototype.loopN = function(n) {
  this.loop(this.d * n)
  return this
}
Ensemble.prototype.rotate = function(angle) {
    if(angle == undefined) {
        angle = 1;
    }
    this.emptyFill();

    for(var i in this.track) {
        this.tracks[i].rotate(angle);
    }
    return this;
}

Ensemble.prototype.__defineGetter__("matrix", function() {
    var matrix = {};
    for(var c in this.tracks) {
        if(this.tracks[c].isAStepTrack)
            matrix[c] = this.tracks[c].steps;
        else
            console.log("skipped incompatible matrix track");
    }
    return matrix;
})
Ensemble.prototype.__defineGetter__("numberedTracks", function() {
    var list = [];
    for(var i in this.tracks) {
        if(!isNaN(parseFloat(i))) {
            list[i] = this.tracks[i];
        }
    }
    return list;
});
Ensemble.prototype.__defineGetter__("trackNames", function() {
    return Object.keys(this.tracks);
});
Ensemble.prototype.randomTrackName = function() {
    var trackNames = this.trackNames;
    return trackNames[Math.floor(Math.random()*trackNames.length)];
}
Ensemble.prototype.randomTrack = function() {
    return this.tracks[this.randomTrackName()];
}
Ensemble.prototype.randomNumberedTrack = function() {
  var numberedTracks = this.numberedTracks
  return numberedTracks[Math.floor(Math.random()*numberedTracks.length)]
}
Ensemble.prototype.mixDownNumberedTracks = function() {
    var newTrack = new PointTrack();
    for(var i in this.tracks) {
        if(isNaN(parseInt(i))) {
            continue;
        }
        newTrack.mix(this.tracks[i], 0);
        delete this.tracks[i];
    }
    this.tracks[0] = newTrack;
    return newTrack;
}
Ensemble.prototype.mixDown = function() {
    var newTrack = new PointTrack();
    for(var i in this.tracks) {
        newTrack.mix(this.tracks[i], 0);
        delete this.tracks[i];
    }
    this.tracks[0] = newTrack;
    return newTrack;
}
Ensemble.prototype.saveMidiFile = function(filename) {
    midi.Ensemble_saveMidiFile(this, filename);
}
Ensemble.prototype.save = function(filename, subdir) {
    filename = (filename || this.label) +  ".mid";
    subdir = subdir || "mididump";
    var path = organise.chooseFilename(filename, subdir);
    this.saveMidiFile(path);
}

Ensemble.prototype.checkNotesAreSorted = function() {
    for(var i in this.tracks) {
        if(this.tracks[i].checkNotesAreSorted) {
            this.tracks[i].checkNotesAreSorted();
        }
    }
}

Ensemble.prototype.__defineGetter__("notes", function() {
  var notes = []
  for(var i in this.tracks) {
    notes = notes.concat(this.tracks[i].notes)
  }
  return notes
})
Ensemble.prototype.__defineGetter__("sounds", function() {
  var sounds = []
  for(var i in this.tracks)
    sounds = sounds.concat(this.tracks[i].sounds)
  return sounds
})
Ensemble.prototype.__defineGetter__("Ts", function() {
  var Ts = []
  for(var i in this.tracks)
    Ts = Ts.concat(this.tracks[i].Ts)
  return Ts
})
Ensemble.prototype.__defineGetter__("smallestPulse", function() {
  var ts = this.Ts
  try {
    return gcd(ts)
  } catch(e) {
    console.log("couldn't find smallest pulse")
    return null
  }
})
Ensemble.prototype.__defineGetter__("octaveProfileStatistics", function() {
  var stats = {}
  for(var c in this.tracks) {
    var trackOp = this.tracks[c].octaveProfileStatistics
    for(var p in trackOp)
      stats[p] = (stats[p] || 0) + trackOp[p]
  }
  return stats
})

Ensemble.channelShift = function(i, channel) {
    if(channel) {
        if(parseInt(i) != NaN) {
            i = parseInt(i) + channel;
        } else if(i.indexOf("#") != -1) {
            i = i.split("#");
            i[1] = parseInt(i[1]) + channel;
            i = i.join("");
        }
    }
    return i;
}
