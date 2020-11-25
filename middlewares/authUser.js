const jwt = require("jsonwebtoken");
const config = require("config");

/*
**********************************************
Authorize User Using Jwt Token
**********************************************
*/

function authUser(req, res, next) {

    let userToken = req.headers["x-auth-token"];
    jwt.verify(userToken, config.get("SecretKey"), (err, data) => {
        if (err) {
            return res.status(401).send({message : err.message});
        }else{
            req.userEmail = data.email;
            next();
        }
    })

}

module.exports = authUser;