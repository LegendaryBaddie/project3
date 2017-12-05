const onMessage = (data) => {
    let message = `<h3>${data.name}</h3>`;
    message += `<p>${data.content}</p>`;
    $('#chat-container').append(`<div class=message><div class=content>${message}</div><div class=merit val=${data.id}><h3>${data.stars}</h3></div></div>`);
    messages[data.id]= data;
} 
const setQuestion = (data) => {
    $('#the-question').html(data.content);
    newTimer(data.time);
}
const setRoomState = (data) => {
    roomState = data;
}
const sendMerit = (data) => {
    console.log(data);
}
const sendQuestion = () =>{
    let question = $('#modal-question').val();
    socket.emit('newQuestion', question);
}
const questionModal = () =>{
    if(roomState === 'notJoined'){
        //return;
    }
    $('#questionModal').css('display', 'block');
}
const newTimer = (length) => {
    clearInterval(timer);
    clock = Math.floor(length/1000);
    timer = setInterval(updateClock, 1000);
}
const setRoomMessages = (data) => {
 let keys = Object.keys(data);
 for(let i = 0; i < keys.length; i++){
     onMessage(data[keys[i]]);
 }
}
const updateClock = () => {
    clock -= 1;
    if(clock == 0){
        clearInterval(timer);
        //dont need to handle a new message because it will be sent by the server
        return;
    }
    //convert to clock format;
    let minutes = 0;
    let seconds = 0;
    if(clock >= 60){
        minutes = Math.floor(clock / 60);
        seconds = clock % 60
    }else{
        seconds = clock;
    }
    if(seconds< 10){
        seconds = `0${seconds}`;
    }
    $('#clock').html(`${minutes}:${seconds}`);
}

const changeRoom = (room) => {
     //check if the clicked room is already active
     if($(`#${room}`).hasClass('active')){
         return;
     }
     //change clicked room to active and remove active on all other
     $('#math').removeClass('active');
     $('#code').removeClass('active');
     $('#science').removeClass('active');
 
     $(`#${room}`).addClass('active');
    
     // add user to the chat room and reset chatbox;

     $('#the-question').html('No Question Asked');
     $('#clock').html('0:00');
     $('#chat-container').html('');
     $('#true-message-field').val('');
     $('#chat-Toggle').css('display', 'initial');
     $('#instruc-toggle').css('display', 'none');
     $('#askButton').css('display', 'block');
     clearInterval(timer);
     clock = 0;
     socket.emit('joinRoom', room);
 }

$('#true-message-field').focusin((e) => {
    $('#true-message-field').keypress((e)=>{
        if(e.which === 13 && $('#true-message-field').val()!=='') {
            let data = {
                message: $('#true-message-field').val(),
                name: account
            };
            $('#true-message-field').val("");
            socket.emit('newMessage', data);
        }
    });
});
