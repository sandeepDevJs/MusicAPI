const jwt = require("jsonwebtoken");
const config = require("config");

function authUser(req, res, next) {

    let userToken = req.headers["x-auth-token"];
    jwt.verify(userToken, config.get("SecretKey"), (err) => {
        if (err) {
            return res.status(401).send({message : err.message});
        }else{
            next();
            return true;
        }
    })

}

module.exports = authUser;