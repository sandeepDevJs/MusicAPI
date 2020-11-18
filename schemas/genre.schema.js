const mongoose = require("mongoose");

let genreSchema = mongoose.Schema({
    genre: { type:String }
});

let Genre = mongoose.model("genre", genreSchema);

module.exports = {
    genreSchema,
    Genre
}