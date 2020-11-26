const helmet = require("helmet");
const morgan = require("morgan");

module.exports = (app) => {

    app.use(express.json());
    // app.use(express.static('./uploads/'));
    app.use(helmet());
    app.use(morgan("tiny"));

}

