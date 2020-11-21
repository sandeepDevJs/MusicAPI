const express = require("express");
const router = express.Router();
const genre = require("../schemas/genre.schema");
const commonFun = require("../common/functions");

//Get All Genre
router.get("/genre", async (req, res) => {
    return res.send(await genre.Genre.find());   
});

//Get Genre By Id 
router.get("/genre/:id", async (req, res) => {
    let isValid = await commonFun.validateId(req.params.id, genre.Genre); 
    if (isValid) {
        return res.send(isValid);
    }else{
        return res.status(404).send({message:"Invalid Id"});
    }  
});

// Post A New Genre 
router.post("/addGenre", async (req, res) => {

    let doCreate = genre.validateGenre(req.body);
    //if returs a error message
    if(doCreate !== true){
        return res.send({message: doCreate});
    }else{
        new genre.Genre(req.body).save();
        return res.send({message:"Genre Created Successfully"});
    }

});

//Update Existing Genre By Id
router.put("/updateGenre/:id", async (req, res) => {
    let doUpdate = await commonFun.validateId(req.params.id, genre.Genre);
    //if invallid id
    if(!doUpdate){
        return res.status(404).send({message:"invalid ID"});
    }
    else{
        doUpdate = genre.validateGenre(req.body);
        if(doUpdate !== true){
            return res.status(404).send({message:doUpdate});
        }   

        await genre.Genre.findOneAndUpdate(
            {_id:req.params.id},
            {$set:req.body}, 
            {
                runValidators:true, 
                new:true, 
                useFindAndModify:false
            }
        );

        return res.send({message:"Data Updated Successfully!!"});
    }
});

//Delete Genre By Id
router.delete("/removeGenre/:id", async (req, res) =>{
    let doDelete = await commonFun.validateId(req.params.id, genre.Genre);
    //if Id is invalid
    if(!doDelete){
        return res.status(404).send({message:doDelete});
    }else{
        await genre.Genre.findByIdAndDelete(req.params.id);
        return res.send({message: "Data Deleted Succesfully"});
    }
})



module.exports = router;