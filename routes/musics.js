const express = require("express");
const router =  express.Router();
const mongoose = require("mongoose");
const Joi = require("joi");
const musicCollection = require("../schemas/musics.schema");
const genreCollection = require("../schemas/genre.schema");

//Setting Up A Mongoose Connection
mongoose.connect("mongodb://localhost:27017/mongoose_db", { useNewUrlParser:true, useUnifiedTopology:true })
.then(() => console.log("Connected to Mongodb"))
.catch(() => console.log("Error Connecting MongoDB"));

const Musics = musicCollection.Musics;
const Genre = genreCollection.Genre;

/* if data is given then it'll validate every field.
   if data=0 and specified is given then it will validate as per field given.*/
function validateData(data, specified={}) {
    if(data !== 0){
        let validateSchema = Joi.object({
            name: Joi.string().min(3).max(50).required(),
            singer: Joi.string().min(3).max(50).required(),
            genre: Joi.string(),
            releaseDate: Joi.date().required(),
            price:Joi.number().required()
        });
        let result = validateSchema.validate(data);
        return (result.error) ? result.error.details[0].message : true;
    }else{
        let designedSchema = {};
        let documentFields = ["name", "singer", "genre", "releaseDate", "price"];
        //designing Schema as per fields Given in Specified object.
        for (let key in specified) {
            if (documentFields.includes(key)) { 
            
                if (key === "name") {
                    designedSchema.name = Joi.string().min(3).max(50).required();
                }
                if (key === "singer") {
                    designedSchema.singer = Joi.string().min(3).max(50).required();
                }
                if (key === "releaseDate") {
                    designedSchema.releaseDate = Joi.date().required();
                }
                if (key === "price") {
                    designedSchema.price = Joi.number().required();
                }
                if (key === "genre") {
                    designedSchema.genre = Joi.string().required();
                }
            }else{
                return {message: `Field Name ${key}  Didn't Match`}
            }
        }
        //if Designed Schema is empty
        if (Object.keys(designedSchema).length !== 0) {
            let validateSchema = Joi.object(designedSchema);
            let result = validateSchema.validate(specified);
            return (result.error) ? result.error.details[0].message : true;
        }else{
            return {message: "No Data given."}
        }
    }

}

//Object Id Validation
async function validateId(id) {
    let musicData;
    try{
        musicData = await Musics.findById(id)
    }
    catch(err){ 
        return false;
    }
    if(!musicData){ 
        return false;
    }
    return musicData;
}

//Get All Music List
router.get("/musics", async (req, res) => {
    res.send( await Musics.find().populate("genre", "genre -_id"));
});

//Get Music By Id
router.get("/musics/:id", async (req, res) => {
    let music = await validateId(req.params.id);
    if (music !== false) {
        res.send(music);
        return true;
    }
    return res.send({message: "Invalid Id"});
});

//Post A New Music
router.post("/createMusic", async (req, res) => {
    let doCreate = validateData(req.body);
    if(doCreate !== true){
        res.send({"error": doCreate});
    }else{
        let musicData =  {
            name:req.body.name,
            singer:req.body.singer,
            genre: req.body.genre,
            releaseDate:req.body.releaseDate,
            price:req.body.price
        }
        new Musics(musicData).save();
        res.send({message: "Data Added Successfully"});
    }
});

//Update Existing Music
router.put("/UpdateMusic/:id", async (req, res) => {
    let doUpdate = validateData(0, req.body);
    if (doUpdate !== true) {
        return res.send(doUpdate);
    }else{
        let isIdValid = await validateId(req.params.id);
        if(!isIdValid){
            return res.status(404).send({message:"Invalid ID"});
        }
        let updatedData =  await Musics.findOneAndUpdate({_id: req.params.id}, {$set: req.body}, {runValidators:true,  new:true, useFindAndModify:false});
        res.send({message:"Data Updated", Result: updatedData});
    }
});

//Delete Data By Id
router.delete("/removeMusic/:id", async (req, res)=>{
    let doDelete = await validateId(req.params.id);
    if(!doDelete ){
        return res.status(404).send({message:"Invalid ID"});
    }
    let deletedData = await Musics.deleteOne({_id: req.params.id});
    if(deletedData.deletedCount > 0){
        return res.send({message:"Data Deleted Successfully."});
    }
    return res.send({message:"No Changes Made"});
});

module.exports = router;