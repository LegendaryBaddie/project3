let timer;
let clock = 0;
let socket;
let messages = {};
// set up states for the room you are in can be
// not joined, question in progress, no question
let roomState = 'notJoined';

const init = () =>{
    socket = io.connect();
    socket.on('msgFromServer', onMessage);
    socket.on('roomStateUpdate', setRoomState);
    socket.on('newQuestion', setQuestion);
    socket.on('allMessages', setRoomMessages);
    $('#math').click(()=>{changeRoom('math')});
    $('#code').click(()=>{changeRoom('code')});
    $('#science').click(()=>{changeRoom('science')});
    $('#askButton').click(questionModal);
    $('#modal-submit').click(sendQuestion);
    
    $(window).click((e)=>{
        if(e.target.id === 'questionModal'){
            $('#questionModal').css('display', 'none');
        }
    });
}

//setInterval(() =>{onMessage(data)}, 5000);

$(document).ready(init);
