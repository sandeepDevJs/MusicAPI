const express = require("express");
const router = express.Router();
const Joi = require("joi");
const genreCollection = require("../schemas/genre.schema");

const Genre = genreCollection.Genre;

function validateGenre(data) {
    if (!data.hasOwnProperty('genre')) {
        return {message : "Invalid Field Name!"}
    }
    let joiSchema = Joi.object({
        genre: Joi.string().min(3).max(10).required()
    });

    let result = joiSchema.validate(data);
    return (result.error)? result.error.details[0].message : true;
}

//Object Id Validation
async function validateId(id) {
    let genreData;
    try{
        genreData = await Genre.findById(id)
    }
    catch(err){ 
        return false;
    }
    if(!genreData){ 
        return false;
    }
    return genreData;
}


router.get("/genre", async (req, res) => {
    res.send(await Genre.find());   
});

router.get("/genre/:id", async (req, res) => {
    let isValid = await validateId(req.params.id); 
    if (isValid) {
        res.send(isValid);
    }else{
        res.status(404).send({message:"Invalid Id"});
    }  
});


router.post("/addGenre", async (req, res) => {

    let doCreate = validateGenre(req.body);
    if(doCreate !== true){
        res.send({message: doCreate});
    }else{
        new Genre(req.body).save();
        res.send({message:"Genre Created Successfully"});
    }

});

router.put("/updateGenre/:id", async (req, res) => {
    let doUpdate = await validateId(req.params.id);
    if(!doUpdate){
        res.status(404).send({message:doUpdate});
        return false
    }
    else{
        doUpdate = validateGenre(req.body);
        if(doUpdate !== true){
            res.status(404).send({message:doUpdate});
            return false;
        }    
        await Genre.findOneAndUpdate({_id:req.params.id}, {$set:req.body}, {runValidators:true, new:true, useFindAndModify:false});
        res.send({message:"Data Updated Successfully!!"});
    }
});

router.delete("/removeGenre/:id", async (req, res) =>{
    let doUpdate = await validateId(req.params.id);
    if(!doUpdate){
        res.status(404).send({message:doUpdate});
        return false
    }else{
        await Genre.findByIdAndDelete(req.params.id);
        res.send({message: "Data Deleted Succesfully"});
    }
})



module.exports = router;