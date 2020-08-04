const socket = io();
let formSubmit = document.querySelector(".form-submit");
const newMessage = document.querySelector("div.chat.p-1");
formSubmit.addEventListener("submit", (e) => {
    e.preventDefault();
    let text = e.target.elements.msg_text.value;
    socket.emit("message", text);
    e.target.elements.msg_text.value = "";
    e.target.elements.msg_text.focus();
})

$("#msg_text").keyup(function () {
    socket.emit("typing", $(this).val());
})

socket.emit("joinchat", "joinchat1");
socket.on("message", (data) => {
    $("div.chat.p-1").append(`<div class="msg my-3" style="background-color: #E4E6FF; color: black;">
                                        <p>Username: <span id="username">${data.username}</span> Time: <span id="time">${data.time}</span></p>
                                        <p id="content"> ${data.text}
                                            </p>
                                    </div>`);
    console.log(data);
})
socket.on("typing", (data) => {
    if (data.text === "") {
        $("#user_typing").text("");
    } else {
        $("#user_typing").text(`${data.username} is typing`);
    }
})
socket.on("userinfo", (data) => {
    console.log(data);
    let txt = ""
    $("#roomName").text(data[0].room);
    for (let i = 0; i < data.length; i++) {
        txt += data[i].username;
    }
    $("#room_member").text(txt);
})