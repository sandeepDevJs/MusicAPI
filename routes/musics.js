const express = require("express");
const mongoose = require("mongoose");
const router =  express.Router();
const Joi = require("joi");

//Setting Up A Mongoose Connection
mongoose.connect("mongodb://localhost:27017/mongoose_db", {useNewUrlParser:true, useUnifiedTopology:true})
.then(() => console.log("Connteced To MongoDB.")).catch(() => console.log("An Error Occurrred While Connecting To Database"));

let musicSchema = {
    name: {type:String, min:3, max:50, required:true},
    singer: {type:String , min:3, max:50, required:true},
    releaseDate: {type:Date},
    price:{type:Number, min:500, max:99999, required:true}
}

let Musics = mongoose.model("music", musicSchema, "music");

function validateData(data) {
    let validateSchema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        singer: Joi.string().min(3).max(50).required(),
        releaseDate: Joi.date().required(),
        price:Joi.number().required()
    });

    let result = validateSchema.validate(data);
    return (result.error) ? result.error.details[0].message : true;

}

//Get All Music List
router.get("/musics", async (req, res) => {
    res.send( await Musics.find());
});

//Get Music By Id
router.get("/musics/:id", async (req, res) => {
    let music;
    try{
        music = await Musics.findById(req.params.id)
    }
    catch(err){
        res.status(404).send({message: "No Data Found"}); 
        return false;
    }
    if(!music){ 
        res.status(404).send({message: "No Data Founssss"}); 
        return false;
    }
    res.send(music);
});

//Post A New Music
router.post("/createMusic", async (req, res) => {
    let doCreate = validateData(req.body);
    if(doCreate !== true){
        res.send({"error": doCreate});
    }else{
        res.send({"message": "successfully validated"});
    }
});

module.exports = router;