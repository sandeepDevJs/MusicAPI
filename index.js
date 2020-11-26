const express = require("express");
const mongoose = require("mongoose");
const Fawn = require("fawn");

/**  
    I N I T I A L I Z A T I O N
**/

const app = express();
Fawn.init(mongoose);


/**  
    DB  C O N N E C T I O N
**/
require("./startup/db.connection")(mongoose);


/**
 * M I D D L E W A R E S 
**/

require("./startup/middlewares")(app)


/** 
 * R O U T E S
**/

require("./startup/routes")(app);


/**
 * S T A R T I N G   S E R V E R
 * 
 * @INFO-
 * 
 * In Case Of Any Incomplete Transactions
 * ROLLBACK & Then Start The Server
 * 
 * 
**/

Fawn.Roller().roll()
            .then(  () => app.listen(4800, () => console.log("Connected to port 4800") ))
            .catch( (err) => console.log("Error Rolling Back:\n", err) )


/*

    TODO:

    1) -> pagination


*/