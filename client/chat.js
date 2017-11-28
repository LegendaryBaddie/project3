const onMessage = (data) => {
    let message = `<h3>${data.name}</h3>`;
    message += `<p>${data.content}</p>`;
    $('#chat-container').append(`<div class=message>${message}</div>`);
    messages[data.id]= data;
} 

const newTimer = (length) => {
    clock = length;
    timer = setInterval(updateClock, 1000);
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
    
     // add user to the chat room and load different partial

     socket.emit('joinRoom', room);
     $('#chat-Toggle').css('display', 'initial');
     $('#instruc-toggle').css('display', 'none');
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
