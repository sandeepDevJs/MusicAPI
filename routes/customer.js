const express = require("express");
const commonFun = require("../common/functions");
const customer = require("../schemas/customer.schema");
const { Musics } = require("../schemas/musics.schema");
const config = require("config");
const Fawn = require("fawn");

const router = express.Router();
Fawn.init(config.get("dbUrl"));

//User Registration
router.post("/register", async (req, res) => {
    let doRegister = customer.validateCustomer(req.body);

    //if returns error message
    if(doRegister !== true){
        return res.send({"message": doRegister});
    }

    let newCustomer = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    }
    
    new customer.Customer(newCustomer).save();
    return res.send({"message" : "Registration Done!!"});

});

router.put("/buyMusic/:id", async (req, res) => {
    let validCustomerId = await commonFun.validateId(req.params.id, customer.Customer);
    if(!validCustomerId){
        return res.status(404).send({message: "Invalid Customer Id"});
    }
    if(!req.body.musicId){
        return res.status(404).send({message: "No 'musicId' field is given"});
    }

    let validateMusicId = await commonFun.validateId(req.body.musicId, Musics);
    if (!validateMusicId) {
        return res.status(404).send({message: "Invalid Music Id"});
    }

    var task = Fawn.Task();
    try{

        task.update("music", {_id:validateMusicId._id}, {$inc : { stock:-1 }})
        .update("customers", {_id:validCustomerId._id}, {$push : { musicBought : { id: validateMusicId._id, music: validateMusicId.name } }})
        .run();

    }catch(err){
        return res.status(505).send({error: err});
    }
    
    // validateMusicId.stock--;
    // validateMusicId.save();

    // validCustomerId.musicBought.push({_id:validateMusicId._id, music:validateMusicId.name})
    // validCustomerId.save();
    
    return res.send({message: "Music Bought!!"});
})


module.exports = router;