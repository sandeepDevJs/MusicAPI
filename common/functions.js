
/*
************************************************************
    Object Id Validation

    @How It Works-

    -> id -> takes Id To Be Validated
    -> Collection -> Takes Mongoose Model (searches into Collection)

    -> returns false if Id is invalid
    -> returns commplete details associated to the given Id
************************************************************
*/

async function validateId(id, Collection) {
    let musicData;
    try{
        musicData = await Collection.findById(id)
    }
    catch(err){ 
        return false;
    }
    if(!musicData){ 
        return false;
    }
    return musicData;
}

module.exports = {
    validateId
}