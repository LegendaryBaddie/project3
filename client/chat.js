const onMessage = (data) => {
    let message = `<h3>${data.userName}</h3>`;
    message += `<p>${data.message}</p>`;
    $('#chat-container').append(`<div class=message>${message}</div>`);
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

$('#true-message-field').focusin((e) => {
    $('#true-message-field').keypress((e)=>{
        if(e.which === 13) {
            data.message = $('#true-message-field').val();
            $('#true-message-field').val("");
            onMessage(data);
        }
    });
});
