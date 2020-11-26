const config = require("config");

module.exports = (mongoose) =>{
    mongoose.connect(config.get("dbUrl"), { useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex: true })
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.log("Error Connecting To DB: \n", err));
}