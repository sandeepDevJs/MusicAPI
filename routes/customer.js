const express = require("express");
const Fawn = require("fawn");
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const multer = require("multer");
const commonFun = require("../common/functions");
const customer = require("../schemas/customer.schema");
const { Musics } = require("../schemas/musics.schema");
const authUser = require("../middlewares/authUser"); 

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    } 
});


const fileFilter = (req, file, cb) => {
    let allowedTypes = [ "image/jpeg", "image/jpg", "image/png" ];
    if(allowedTypes.includes(file.mimetype)){
        cb(null, true)
    }else{
        req.invalidFormatErr = "Invalid Email";
        cb(null, false)
    }
}

const upload = multer({storage: storage, fileFilter: fileFilter}).single('profile');



router.put("/addProfile", authUser,  async (req, res) => {

    let userdata = await customer.Customer.findOne({email: req.userEmail});
    upload(req, res, (err) =>{
        if (req.invalidFormatErr) {
            return  res.send({message: "Invalid Format!"});
        }
        userdata.profile = req.file.originalname;
        userdata.save();
        res.send({message:"Data Updated Successfully!!"});
    })

});

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

router.post("/forgotPassword", async(req, res) => {
    if (!req.body.email) {
        return res.send({message: "No Email Was Provided."});
    }
    
    //it'll only validate email
    let validEmail = customer.validateCustomer(req.body, true);
    if(validEmail !== true){
        return res.send({message:"Invalid Email."});
    }

    let email = await customer.Customer.findOne({email: req.body.email});
    if (!email) return res.send({message : "Given Email Is Not Registered."});

    //Generating Reset token
    let resetToken = crypto.randomBytes(35).toString("hex");
    email.resetPasswordToken = resetToken;
    email.resetpasswordExpAt = new Date() + 1800000; // 1000msec = 1sec; 1000*60 (1 minute);  1000*60*30 = 30minutes
    email.save();

    //setting up transporter for nodemailer
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
            user: "baylee0@ethereal.email",
            pass: "QH8TDdRjZcKrnD78Wf"
        }
    })
    

    await transporter.sendMail(
        {
            from: "'Music Api' <sandygupta8291@gmail.com>",
            to: req.body.email,
            subject: "Change Password",
            text: "Use Below Token to Change Your Password.\n" + resetToken    
        }, 

        (err, info) => {
                if (err) {
                    console.log(err);
                    return res.send({message : "An Error Occured While Sending Mail"});
                }else{
                    return res.send({message : "Check Your Mail For Password Change"})
                }
         }
    );

})

router.put("/resetPassword/:userToken", async (req, res) => {
    if(!req.params.userToken){
        return res.send({message:"No Token Given"});
    }

    //token has user data
    let token = await customer.Customer.findOne({resetPasswordToken : req.params.userToken.toString()});
    if(!token.email) return res.status(403).send({message: "Invalid Token!!"});

    if(token.resetpasswordExpAt > Date.now() ){
        return res.status(403).send({message: "Token Expired."});
    }

    if(!req.body.password){
        return res.send({message: "No Password Given."});   
    }

    //password Validation
    isValidPassword = customer.validateCustomer(req.body, true);
    //if password validation returns error
    if(isValidPassword !== true){
        return res.send({message: password}); //send validation error
    }

    //hash password
    let salt = await bcrypt.genSalt(10);
    await bcrypt.hash(req.body.password, salt, (err, hashedPass) => {
        if(err){
            res.status(500).send({message: "Internal Error Occurred."});
        }else{
            // let task = Fawn.Task();
            // console.log(token.email)
            // task.update("customers", {_id : token._id}, {$set : { resetPasswordToken : undefined } })
            //     .update("customers", {_id : token._id}, {$set : { resetpasswordExpAt : undefined } })
            //     .update("customers", {_id : token._id}, {$set : { password : hashedPass }})
            //     .run()
            //     .then( () => res.send({message : "Password Changed Successfully!!"}))
            //     .catch( () => res.status(500).send({message : "Error occured"}) )

            token.resetPasswordToken = undefined;
            token.resetpasswordExpAt = undefined;
            token.password = hashedPass;
            token.save();
            return res.send({message : "Password Changed Successfully!!"});

        }
    });
    
});



module.exports = router;