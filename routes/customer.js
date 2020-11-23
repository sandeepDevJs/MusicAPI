const express = require("express");
const Fawn = require("fawn");
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const commonFun = require("../common/functions");
const customer = require("../schemas/customer.schema");
const { Musics } = require("../schemas/musics.schema");
const authUser = require("../middlewares/authUser"); 

const router = express.Router();

//User Registration
router.post("/register", async (req, res) => {
    let doRegister = customer.validateCustomer(req.body);

    //if returns error message
    if(doRegister !== true){
        return res.send({"message": doRegister});
    }

    //if Email Already Exists
    let email = await customer.Customer.findOne({email : req.body.email.trim()});
    if(email){
        return res.send({message : "Given Email Already Exists"});
    }

    //encrypt User Password
    let salt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(req.body.password, salt);

    let newCustomer = {
        name: req.body.name,
        email: req.body.email,
        password: newPassword
    }
    
    new customer.Customer(newCustomer).save();
    return res.send({"message" : "Registration Done!!"});

});

// User Login
router.post("/login", async (req, res) => {
    let email = await customer.Customer.findOne({ email : req.body.email });
    if(!email) return res.send({message:"Invalid Email"});

    bcrypt.compare(req.body.password, email.password, (err, same) => {
        if(same){
           let accessToken = jwt.sign({email :email.email}, config.get("SecretKey"), {expiresIn : "1h"});
           res.send({message: "Login Success!!", Token: accessToken})
        }else{
            return res.send({message:"Invalid Password"});
        }
    })


});


router.put("/buyMusic/:id", async (req, res) => {
    //validate customer ID
    let validCustomerId = await commonFun.validateId(req.params.id, customer.Customer);
    if(!validCustomerId){
        return res.status(404).send({message: "Invalid Customer Id"});
    }

    //validate Music ID
    if(!req.body.musicId){
        return res.status(404).send({message: "No 'musicId' field is given"});
    }
    let validateMusicId = await commonFun.validateId(req.body.musicId, Musics);
    if (!validateMusicId) {
        return res.status(404).send({message: "Invalid Music Id"});
    }

    // Checking Stock Availability
    if (validateMusicId.stock === 0) {
        return res.send({message: "Sorry!! This Song Is Out Of Stock"});
    }

    // Upadating data
    var task = Fawn.Task();
    try{

        task.update("music", {_id:validateMusicId._id}, {$inc : { stock:-1 }})
        .update("customers", {_id:validCustomerId._id}, {$push : { musicBought : { id: validateMusicId._id, music: validateMusicId.name } }})
        .run();

    }catch(err){
        return res.status(500).send({message: "An Error Occured."});
    }
    
    return res.send({message: "Thank You For Buying."});
});

router.get("/getUsers", authUser, (req, res) => {

    res.send({message: "Authentication Successfull!!"});

})


module.exports = router;