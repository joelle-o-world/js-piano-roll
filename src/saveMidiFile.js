
//const organise = require("../../organise.js");
var midi = require("./midi");

module.exports = (PianoRoll) => {
  PianoRoll.prototype.saveMidiFile = function(filename) {
      if(filename == undefined) {
          throw "no filename provided";
          return ;
      }
      midi.PianoRoll_saveMidiFile(this, filename);
  }

  /*PianoRoll.prototype.save = function(filename, subdir) {
      // not tested
      filename = filename || this.label || "pianoroll.mid";
      if(filename.slice(filename.length-4) != ".mid")
          filename += ".mid";
      subdir = subdir || "mididump";
      var path = organise.chooseFilename(filename, subdir);
      this.saveMidiFile(path);
  }*/
}
