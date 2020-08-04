const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const chalk = require('chalk');
const mongoose = require("mongoose");
const usersModel = require("./models/users");
const moment = require("moment");

function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format("h:mm a")
    }
}
mongoose.connect('mongodb://localhost:27017/chatapp', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
});
let user = {};
app.set("view engine", "ejs");
app.use(express.static("public"))

app.get('/', (req, res) => {
    res.render("main");
});
app.get("/room", (req, res) => {
    user.username = req.query.username;
    user.room = req.query.room;
    res.render("index");
})
io.on('connection', (socket) => {
    socket.on("joinchat", async () => {
        await usersModel.create({
            username: user.username,
            room: user.room,
            socketId: socket.id
        });
        socket.join(user.room);
        socket.emit("message", formatMessage("Bot", "Welcome to chatbot"));
        socket.broadcast.to(user.room).emit("message", formatMessage("Bot", `${user.username} is join the chat`));
        await usersModel.find({
            room: user.room
        }, (err, returnData) => {
            if (err) {
                console.log(err);
            } else {
                io.to(user.room).emit("userinfo", returnData);
            }
        })

    })

    socket.on("message", (data) => {
        usersModel.findOne({
            socketId: socket.id
        }, function (err, returnData) {
            if (err) {
                console.log(err);
            } else {
                io.to(returnData.room).emit("message", formatMessage(returnData.username, data));
            }
        })
    })
    socket.on("typing", (data) => {
        usersModel.findOne({
            socketId: socket.id
        }, function (err, returnData) {
            if (err) {
                console.log(err);
            } else {
                socket.broadcast.to(returnData.room).emit("typing", {
                    username: returnData.username,
                    text: data
                });
            }
        })
    })
    socket.on("disconnect", async () => {
        await usersModel.findOne({
            socketId: socket.id
        }, function (err, returnData) {
            if (err) {
                console.log(err);
            } else {
                socket.broadcast.to(returnData.room).emit("message", formatMessage("Bot", `${returnData.username} is left the chat`));
            }
        })
        await usersModel.findOneAndDelete({
            socketId: socket.id
        }, function (err, returnData) {
            if (err) {
                console.log(err);
            } else {
                console.log("Deleted");
            }
        })

    })
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});