const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("config");
const mongoose = require("mongoose");

const musics = require("./routes/musics");
const genre = require("./routes/genre");
const customer = require("./routes/customer"); 
const app = express();

//Setting Up A Mongoose Connection
mongoose.connect(config.get("dbUrl"), { useNewUrlParser:true, useUnifiedTopology:true })
.then(() => console.log("Connected to DB"))
.catch((err) => console.log("Error Connecting To DB: \n", err));

//middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan("tiny"));

//Routes
app.use("/api", musics);
app.use("/api", genre);
app.use("/api", customer);

app.listen(4800, () => console.log("Connected to port 4800") )

/*

    TODO:

    1) -> create registration & Login
    DB relation video


*/