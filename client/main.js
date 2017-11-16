let placeholder = "MESSAGE DATA FROM SOCKET IO WILL LOAD IN HERE";
let data = {
    userName: "fakeGuy",
    message: "I really wish this had functionality yet"
}
let timer;
let clock = 0;

const init = () =>{
    newTimer(100);
}

//setInterval(() =>{onMessage(data)}, 5000);

$(document).ready(init);