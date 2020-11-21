const mongoose = require("mongoose");
const Joi = require("joi");


let genreSchema = mongoose.Schema({
    genre: { type:String }
});

let Genre = mongoose.model("genre", genreSchema);

/*
************************************************************
    Genre Field Validation

    @How It Works-

    -> data -> takes Object To Be Validated

    -> returns true if data is validated successfully.
    -> returns error message if validation fails.
************************************************************
*/

function validateGenre(data) {
    if (!data.hasOwnProperty('genre')) {
        return "Invalid Field Name!";
    }
    let joiSchema = Joi.object({
        genre: Joi.string().min(3).max(10).required()
    });

    let result = joiSchema.validate(data);
    return (result.error)? result.error.details[0].message : true;
}

module.exports = {
    genreSchema,
    Genre,
    validateGenre
}