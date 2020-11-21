const express = require("express");
const musicCollection = require("../schemas/musics.schema");
const genreCollection = require("../schemas/genre.schema");
const commonFun = require("../common/functions");

const router =  express.Router();
const Musics = musicCollection.Musics;
const Genre = genreCollection.Genre;

//Get All Music List
router.get("/musics", async (req, res) => {
    res.send( await Musics.find());
});

//Get Music By Id
router.get("/musics/:id", async (req, res) => {
    let music = await commonFun.validateId(req.params.id, Musics);
    if (music !== false) {
        res.send(music);
        return true;
    }
    return res.send({message: "Invalid Id"});
});

//Post A New Music
router.post("/createMusic", async (req, res) => {
    let doCreate = await musicCollection.validateMusic(req.body);

    //if returs a error message
    if(doCreate !== true){
        res.send({"error": doCreate});
    }else{
        //validating Gerne Id
        doCreate = await commonFun.validateId(req.body.genre, Genre);
        if(!doCreate){
            res.status(404).send({"error": "Invalid Genre ID"});
            return false;
        }
        let musicData =  {
            name:req.body.name,
            singer:req.body.singer,
            genre: doCreate.genre,  
            releaseDate:req.body.releaseDate,
            stock: req.body.stock,
            price:req.body.price
        }
        new Musics(musicData).save();
        res.send({message: "Data Added Successfully"});
    }
});

//Update Existing Music By Id
router.put("/UpdateMusic/:id", async (req, res) => {
    let doUpdate = musicCollection.validateMusic(req.body, true);

    //if returns a error message
    if (doUpdate !== true) {
        return res.send({ message : doUpdate});
    }else{

        //validate Music Id
        let isIdValid = await commonFun.validateId(req.params.id, Musics);
        if(!isIdValid){
            return res.status(404).send({message:"Invalid ID"});
        }

        //if genre Id updation is requested
        if (req.body.genre) {

            //then Validate genre Id
            isIdValid = await commonFun.validateId(req.body.genre, Genre);
            if(!isIdValid){
                res.status(404).send({"error": "Invalid Genre ID"});
                return false;
            }
            
        }
        let updatedData =  await Musics.findOneAndUpdate(
            {_id: req.params.id}, 
            {$set: req.body}, 
            {
                runValidators:true,
                new:true, 
                useFindAndModify:false
            }
        );

        res.send({message:"Data Updated", Result: updatedData});
    }
});

//Delete Data By Id
router.delete("/removeMusic/:id", async (req, res)=>{
    let doDelete = await commonFun.validateId(req.params.id, Musics);

    //if invalid Id
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