const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("config");
const mongoose = require("mongoose");
const Fawn = require("fawn");

const musics = require("./routes/musics");
const genre = require("./routes/genre");
const customer = require("./routes/customer"); 

const app = express();
Fawn.init(mongoose);
const roller = Fawn.Roller();


//Setting Up Mongoose Connection
mongoose.connect(config.get("dbUrl"), { useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex: true })
.then(() => console.log("Connected to DB"))
.catch((err) => console.log("Error Connecting To DB: \n", err));

//middlewares
app.use(express.json());
// app.use(express.static('./uploads/'));
app.use(helmet());
app.use(morgan("tiny"));

//Routes
app.use("/api", musics);
app.use("/api", genre);
app.use("/api", customer);

//Rollback All Incomplete Transactions
roller.roll()
      .then(() => {app.listen(4800, () => console.log("Connected to port 4800") )})
      .catch( (err) => console.log("Error Rolling Back:\n", err) )


/*

    TODO:

    1) -> file upload
    2) -> pagination


*/