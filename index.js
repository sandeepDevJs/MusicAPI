const express = require("express");
const musics = require("./routes/musics");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("tiny"));
app.use("/api", musics);

app.listen(4800, () => console.log("Connected to port 4800") )