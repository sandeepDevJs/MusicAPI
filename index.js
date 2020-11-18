const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const musics = require("./routes/musics");
const genre = require("./routes/genre");

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("tiny"));
app.use("/api", musics);
app.use("/api", genre);

app.listen(4800, () => console.log("Connected to port 4800") )