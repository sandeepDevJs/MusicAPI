module.exports = (app) => {
    app.use("/api", require("../routes/musics"));
    app.use("/api", require("../routes/genre"));
    app.use("/api", require("../routes/customer"));
}