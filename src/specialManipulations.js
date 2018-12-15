
const make_roll = require("../make_roll.js")

const duplicate = require("./duplicate.js")

module.exports = (PianoRoll) => {

  PianoRoll.prototype.rollNote = function(note, n) {
    var noteI;
    if(typeof note == "number") {
      noteI = note;
      note = this.notes[noteI];
    } else if(note.isPianoRollNote) {
      noteI = this.notes.indexOf(note);
    }
    if(noteI < 0 || noteI >= this.notes.length) {
      console.log("could not roll note because it does not exist", noteI);
      return ;
    }
    if(note.d == undefined) {
      console.log("could not roll note because it is of undefined duration");
      return ;
    }
    if(n == undefined) {
      n = note.d;
    }

    var roll = make_roll(note.d, n);
    for(var i in roll.notes) {
      roll.notes[i].sound = duplicate(note.sound);
    }
    this.notes.splice(noteI, 1);

    this.mix(roll, note.t);

    return this;
  }

  PianoRoll.prototype.rollRandomNote = function(n) {
    n = n || 10
    n = Math.floor(Math.random()*n)
    var i = Math.floor(this.notes.length*Math.random())

    return this.rollNote(i, n)
  }
}
