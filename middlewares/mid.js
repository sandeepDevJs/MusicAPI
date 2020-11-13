function working(req, res, next) {
    req.requestTime = Date.now();
    console.log(req.requestTime);
    next();
}

module.exports = working;