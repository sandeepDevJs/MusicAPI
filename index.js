const express = require("express");
const musics = require("./routes/musics");
const app = express();


app.use(express.json());
app.use("/api", musics);

app.listen(4800, () => console.log("Connected to port 4800") )