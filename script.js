let username="";
let currentRoom="General";

const chatChannel = new BroadcastChannel("chat_channel");
const userChannel = new BroadcastChannel("user_channel");

let users=[];

/* JOIN */
function joinChat(){
    const name=document.getElementById("username").value.trim();
    if(name===""){alert("Enter name");return;}

    username=name;

    document.getElementById("loginBox").style.display="none";
    document.getElementById("chatContainer").style.display="flex";

    userChannel.postMessage({type:"join",user:username});
}

/* ROOMS */
function joinRoom(room){
    currentRoom=room;
    document.getElementById("roomTitle").innerText="Room: "+room;
    document.getElementById("messages").innerHTML="";
}

function createRoom(){
    const room=document.getElementById("newRoom").value.trim();
    if(room==="") return;

    const li=document.createElement("li");
    li.innerText=room;
    li.onclick=()=>joinRoom(room);
    document.getElementById("roomList").appendChild(li);

    document.getElementById("newRoom").value="";
}

/* SEND */
function sendMessage(){
    const input=document.getElementById("messageInput");
    const text=input.value.trim();
    if(text==="") return;

    chatChannel.postMessage({
        user:username,
        room:currentRoom,
        text:text,
        time:new Date().toLocaleTimeString()
    });

    input.value="";
}

/* ENTER SEND */
document.addEventListener("keypress",function(e){
    if(e.key==="Enter") sendMessage();
});

/* RECEIVE */
chatChannel.onmessage=function(e){
    const data=e.data;
    if(data.room!==currentRoom) return;

    const msg=document.createElement("div");

    if(data.user===username){
        msg.className="myMsg";
    } else{
        msg.className="otherMsg";
    }

    msg.innerHTML=`<b>${data.user}</b><br>${data.text}<span>${data.time}</span>`;
    const box=document.getElementById("messages");
    box.appendChild(msg);
    box.scrollTop=box.scrollHeight;
};

/* USERS */
userChannel.onmessage=function(e){
    const data=e.data;

    if(data.type==="join"){
        if(!users.includes(data.user)){
            users.push(data.user);
            updateUsers();
        }
    }
};

function updateUsers(){
    const ul=document.getElementById("userList");
    ul.innerHTML="";
    users.forEach(u=>{
        const li=document.createElement("li");
        li.innerText=u;
        ul.appendChild(li);
    });
}
