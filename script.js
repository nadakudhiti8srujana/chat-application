let username = "";
let currentRoom = "General";

const chatChannel = new BroadcastChannel("chat_channel");
const userChannel = new BroadcastChannel("user_channel");

let activeUsers = [];

/* ======================
   JOIN CHAT
====================== */
function joinChat() {
    const name = document.getElementById("username").value.trim();

    if (name === "") {
        alert("Enter username");
        return;
    }

    if (activeUsers.includes(name)) {
        alert("Username already in use. Choose another.");
        return;
    }

    username = name;
    activeUsers.push(username);

    userChannel.postMessage({ type: "join", user: username });

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("chatContainer").style.display = "flex";
}

/* ======================
   ROOM FUNCTIONS
====================== */
function joinRoom(room) {
    currentRoom = room;
    document.getElementById("chatHeader").innerText = "Room: " + room;
    document.getElementById("messages").innerHTML = "";
}

function createRoom() {
    const room = document.getElementById("newRoom").value.trim();
    if (room === "") return;

    const li = document.createElement("li");
    li.innerText = room;
    li.onclick = () => joinRoom(room);
    document.getElementById("roomList").appendChild(li);

    document.getElementById("newRoom").value = "";
}

/* ======================
   TEXT FORMATTING
====================== */
function formatMessage(text) {
    text = text.replace(/\*(.*?)\*/g, "<b>$1</b>");
    text = text.replace(/_(.*?)_/g, "<i>$1</i>");
    text = text.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank">$1</a>'
    );
    return text;
}

/* ======================
   SEND MESSAGE
====================== */
function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();
    if (text === "") return;

    chatChannel.postMessage({
        user: username,
        room: currentRoom,
        text: formatMessage(text),
        time: new Date().toLocaleTimeString()
    });

    input.value = "";
}

/* ======================
   RECEIVE MESSAGE
====================== */
chatChannel.onmessage = function (event) {
    const data = event.data;
    if (data.room !== currentRoom) return;

    const msg = document.createElement("div");
    msg.className = "message";
    msg.innerHTML = `<b>${data.user}</b> (${data.time}): ${data.text}`;

    const messages = document.getElementById("messages");
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
};

/* ======================
   USER TRACKING
====================== */
userChannel.onmessage = function (event) {
    const data = event.data;

    if (data.type === "join" && !activeUsers.includes(data.user)) {
        activeUsers.push(data.user);
    }

    if (data.type === "leave") {
        activeUsers = activeUsers.filter(u => u !== data.user);
    }
};

window.addEventListener("beforeunload", () => {
    userChannel.postMessage({ type: "leave", user: username });
});
