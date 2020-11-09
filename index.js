const express = require("express");
const joi = require("joi");
const app = express();
app.use(express.json());

app.listen(4800, () => console.log("server started"));

let musics = [
    {
        id: 1,
        name: "Godzilla",
        singer: "Eminem",
        releaseDate: "January 31, 2020",
        price: 1000
    },
    {
        id: 2,
        name: "Not Afraid",
        singer: "Eminem",
        releaseDate: "January 31, 2020",
        price: 2000
    },
    {
        id: 3,
        name: "Till I collapse",
        singer: "Eminem",
        releaseDate: "January 31, 2020",
        price: 3000
    },
    {
        id: 4,
        name: "Venom",
        singer: "Eminem",
        releaseDate: "January 31, 2020",
        price: 4000
    }
    
];

function validate_data(body) {
    let schema = joi.object({
        name: joi.string().max(10).min(2).required(),
        singer: joi.string().max(10).min(2).required(),
        releaseDate: joi.string().max(10).min(2).required(),
        price: joi.number().max(10).min(2).required(),

    });

    return schema.validate(body);
}


app.get("/api/musics", (req, res) => {
    res.send(musics);
});

app.get("/api/musics/:id", (req, res) => {
    let music = musics.find((item) => item.id === parseInt(req.params.id) )
    res.send(music);
});

app.post("/api/createMusic", (req, res) => {
   
    let result = validate_data(req.body);
    if(result.error){
        return res.send({message : result.error.details[0].message});
    }

    let music = {
        id: musics.length + 1,
        name: req.body.name,
        singer: req.body.singer,
        releaseDate: req.body.releaseDate,
        price: req.body.price
    }

    musics.push(music)
    res.send(music);
    
});

app.put("/api/updateMusic/:id", (req, res)=> {
    let music = musics.find((item) => item.id === parseInt(req.params.id) );
    if (!music) {
        return res.send({message:"not found"}) 
    }
    let result = validate_data(req.body);
    if(result.error){
        return res.send({message : result.error.details[0].message});
    }

    let musicid = musics.indexOf(music);

    musics[musicid].name = req.body.name;
    musics[musicid].singer = req.body.singer;
    musics[musicid].releaseDate = req.body.releaseDate;
    musics[musicid].price = req.body.price;

    res.send(musics);
    
});

app.delete("/api/removeMusic/:id", (req, res) => {
    let music = musics.find((item) => item.id === parseInt(req.params.id) );
    if (!music) {
        return res.send({message:"not found"}) 
    }
    let musicid = musics.indexOf(music);
    musics.splice(musicid, 1);
    res.send({message: "Data Deleted."});
})