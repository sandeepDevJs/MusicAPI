const mongoose =  require("mongoose");

const musicSchema = mongoose.Schema({
    name: {type:String, min:3, max:50, required:true},
    genre: { type:mongoose.Schema.Types.ObjectId, ref:"genre" },
    singer: {type:String , min:3, max:50, required:true},
    releaseDate: {type:Date},
    price:{type:Number, min:500, max:99999, required:true}
});

const Musics = mongoose.model("music", musicSchema, "music");

module.exports = {
    musicSchema,
    Musics
}