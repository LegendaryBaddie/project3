let placeholder = "MESSAGE DATA FROM SOCKET IO WILL LOAD IN HERE";
let data = {
    userName: "fakeGuy",
    message: "I really wish this had functionality yet"
}
let timer;
let clock = 0;
let socket;
let messages = {};

const init = () =>{
    socket = io.connect();
    socket.on('msgFromServer', onMessage);
    $('#math').click(()=>{changeRoom('math')});
    $('#code').click(()=>{changeRoom('code')});
    $('#science').click(()=>{changeRoom('science')});
}

//setInterval(() =>{onMessage(data)}, 5000);

$(document).ready(init);
