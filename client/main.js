let timer;
let clock = 0;
let socket;
let messages = {};
// set up states for the room you are in can be
// not joined, question in progress, no question

const init = () =>{
    socket = io.connect();
    socket.on('msgFromServer', onMessage);
    socket.on('newQuestion', setQuestion);
    socket.on('allMessages', setRoomMessages);
    socket.on('resetQuestion', resetQuestion);
    socket.on('queueUpdate', queueDisplay);
    socket.on('summary', fullSummary);
    $('#math').click(()=>{changeRoom('math')});
    $('#code').click(()=>{changeRoom('code')});
    $('#science').click(()=>{changeRoom('science')});
    $('#askButton').click(()=>{modal(true)});
    $('#modal-submit').click(sendQuestion);
    
    $(window).click((e)=>{
        if(e.target.id === 'Modal'){
            $('#Modal').css('display', 'none');
            $('#modal-summary').css('display', 'none');
            $('#modal-inner-content').css('display', 'none');
        }
    });
}

//setInterval(() =>{onMessage(data)}, 5000);

$(document).ready(init);
