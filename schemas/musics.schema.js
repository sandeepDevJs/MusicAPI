const mongoose =  require("mongoose");
const Joi = require("joi");

const musicSchema = mongoose.Schema({
    name: {type:String, min:3, max:50, required:true},
    genre: { type: String, required:true },
    singer: {type:String , min:3, max:50, required:true},
    releaseDate: {type:Date, required:true},
    stock: {type: Number, required:true, min:0, default:0},
    price:{type:Number, min:500, max:99999, required:true}
});

const Musics = mongoose.model("music", musicSchema, "music");

/* 
    ****************************************************************************************

    Validates music data in both the ways i.e. on insertion & on updation

    @How It Works-

    -> if isUpdateValidation is set to true then it'll validate 
        for updation i.e. it'll validate only provided fields.

    -> else it will validate every field i.e. for insertion.

    -> returns true if validation is succesfully validated.

    -> returns error messages if fails to validate

    *****************************************************************************************
*/
function validateMusic(data, isUpdateValidation=false) {

    let validateSchema;

    if(!isUpdateValidation){

        validateSchema = Joi.object({
            name: Joi.string().min(3).max(50).required(),
            singer: Joi.string().min(3).max(50).required(),
            genre: Joi.string().required(),
            releaseDate: Joi.date().required(),
            stock: Joi.number().required(),
            price:Joi.number().required()
        });

    }else{

        validateSchema = Joi.object({
            name: Joi.string().min(3).max(50),
            singer: Joi.string().min(3).max(50),
            genre: Joi.string().min(20).max(50),
            releaseDate: Joi.date().min(10),
            stock: Joi.number().min(0),
            price:Joi.number().min(1000).max(20000)
        });

    }
    
    let result = validateSchema.validate(data);
    return (result.error) ? result.error.details[0].message : true;
    
}


module.exports = {
    musicSchema,
    Musics,
    validateMusic
}