const mongoose = require("mongoose");
const Joi = require("joi");

const customerSchema = mongoose.Schema({
    name: { type:String, required:true, min:3, max:20 },
    email: { type:String, required:true, unique:true },
    password: { type:String, required:true },
    resetPasswordToken : {type:String},
    resetpasswordExpAt: {type:Date},
    musicBought : [ {type: Object} ]
});

const Customer = mongoose.model("customer", customerSchema);

//Validate Customer
function validateCustomer(data, isUpdateValidation=false) {

    let customerSchema;

    if (!isUpdateValidation) {
     
        customerSchema = Joi.object({
            name: Joi.string().min(3).max(20).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(4).max(8).required(),
        });
        
    }else{

        customerSchema = Joi.object({
            name: Joi.string().min(3).max(20),
            email: Joi.string().email().min(5),
            password: Joi.string().min(4).max(8)
        });

    }

    let result = customerSchema.validate(data);
    return (result.error)? result.error.details[0].message : true;
}


module.exports = {
    Customer,
    validateCustomer
}