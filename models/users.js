const mongoose = require("mongoose");
const moment = require("moment");
const usersSchema = new mongoose.Schema({
    username: String,
    room: String,
    socketId: String,
    time: {
        type: String,
        default: moment().format("h:mm a")
    }
})

module.exports = mongoose.model("Users", usersSchema);