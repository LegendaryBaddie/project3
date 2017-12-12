
const onMessage = (data) => {
    let message = `<h2>${data.name}</h2>`;
    message += `<p>${data.content}</p>`;
    $('#chat-container').append(`<div class=message><div class=content>${message}</div><div class=merit onClick=sendMerit(this) id=${data.id}><h3>${data.stars}</h3></div></div>`);
    messages[data.id]= data;
    scrollSum += 100;
    $('#chat-container').scrollTop(scrollSum);
} 
const setQuestion = (data) => {
    $('#the-question').html(data.content);
    newTimer(data.time);
    $('#true-message-field').removeAttr('disabled');
    scrollSum = 0;
    $('#chat-container').empty();
}
const queueDisplay = (data) => {
    $('#queue-count').html(`Questions in Queue: ${data}`);
}
const sendMerit = (data) => {
    //check if the person clicking owns the message
    if(messages[data.id].name === account){
        return;
    }
    socket.emit('addMerit', data.id);
}
const sendQuestion = () =>{
    let question = $('#modal-question').val();
    $('#Modal').css('display', 'none');
    $('#modal-inner-content').css('display', 'none');
    $('#modal-question').val('');
    socket.emit('newQuestion', question);
}
const extendClock = () => {
    if(clock>5){
    socket.emit('extendClock');
    }
}
const clockExtension = () => {
    clock+= 60;
}
const resetQuestion = () => {
    $('#the-question').html("No Question Asked");
    $('#clock').html('0:00');
    $('#chat-container').empty();
    scrollSum = 0;
    // disable sending messages 
    $('#true-message-field').attr('disabled', 'true');
}
const modal = (toggle) =>{
    $('#Modal').css('display', 'block');
    // true means its question
    if(toggle){
        $('#modal-inner-content').css('display', 'block');
    }else{
        $('#modal-summary').css('display', 'block');
    }
}
const fullSummary = (data) =>{
    //clear summary
    $('#modal-summary-best').empty();
    $('#modal-summary-messages').empty();
    //check for #1 post
    let keys = Object.keys(data.messages);
    let hKeys = Object.keys(data.highestMessage);
    //at least two messages with the same merit count
    if(data.highestMessage !== undefined){
    if(hKeys.length>1){
        for(let k=0; k< hKeys.length; k++){
            $('#modal-summary-best').append(`<div class=message><div class=content>
            <h3>${data.highestMessage[hKeys[k]].name}</h3><p>${data.highestMessage[hKeys[k]].content}</p></div></div>`);
        }
    }else{
    $('#modal-summary-best').html(`<h2>Your highest rated answer</h2><div class=message><div class=content>
    <h3>${data.highestMessage[hKeys[0]].name}</h3><p>${data.highestMessage[hkeys[0]].content}</p></div></div>`);
    }
    }
    for(let i=0;i<keys.length;i++){
    let message = `<h3>${data.messages[keys[i]].name}</h3>`;
    message += `<p>${data.messages[keys[i]].content}</p>`;
    $('#modal-summary-messages').append(`<div class=message><div class=content>${message}</div></div>`);
    }
    modal(false);
};
const newTimer = (length) => {
    clearInterval(timer);
    clock = Math.floor(length/1000);
    timer = setInterval(updateClock, 1000);
}
const setRoomMessages = (data) => {
    //clear all messsages first
    $('#chat-container').empty();
    scrollSum = 0;
    messages = {};
 let keys = Object.keys(data);
 for(let i = 0; i < keys.length; i++){
     onMessage(data[keys[i]]);
 }
}
const updateClock = () => {
    clock -= 1;
    if(clock == 0){
        clearInterval(timer);
        $('#clock').html('0:00');
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
     $('#instru-toggle').css('display', 'none');
     $('#askButton').css('display', 'block');
     $('#queue-box').css('display', 'block');
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
            $('#true-message-field').empty();
            $('#true-message-field').val("");
            socket.emit('newMessage', data);
        }
    });
});
