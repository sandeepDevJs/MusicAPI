function working(req, res, next) {
    console.log("working");
    next();
}

module.exports = working;