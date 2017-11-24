"use strict";

$(document).ready(function () {

    var handleError = function handleError(message) {
        $("#errorMessage").text(message);
    };

    var sendAjax = function sendAjax(action, data) {
        $.ajax({
            cache: false,
            type: "POST",
            url: action,
            data: data,
            dataType: "json",
            success: function success(result, status, xhr) {
                window.location = result.redirect;
            },
            error: function error(xhr, status, _error) {
                //const messageObj = JSON.parse(xhr.responseText);
                console.dir(_error);
                //handleError(xhr.responseText);
            }
        });
    };

    $("#signupSubmit").on("click", function (e) {
        e.preventDefault();

        if ($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
            handleError("All fields are required");
            return false;
        }

        if ($("#pass").val() !== $("#pass2").val()) {
            handleError("Passwords do not match");
            return false;
        }

        sendAjax($("#signupForm").attr("action"), $("#signupForm").serialize());

        return false;
    });

    $("#loginSubmit").on("click", function (e) {
        e.preventDefault();

        if ($("#userL").val() == '' || $("#passL").val() == '') {
            handleError("Username or password is empty");
            return false;
        }

        sendAjax($("#loginForm").attr("action"), $("#loginForm").serialize());
        return false;
    });
});
'use strict';

var onMessage = function onMessage(data) {
    var message = '<h3>' + data.userName + '</h3>';
    message += '<p>' + data.message + '</p>';
    $('#chat-container').append('<div class=message>' + message + '</div>');
};

var newTimer = function newTimer(length) {
    clock = length;
    timer = setInterval(updateClock, 1000);
};

var updateClock = function updateClock() {
    clock -= 1;
    if (clock == 0) {
        clearInterval(timer);
        //dont need to handle a new message because it will be sent by the server
        return;
    }
    //convert to clock format;
    var minutes = 0;
    var seconds = 0;
    if (clock >= 60) {
        minutes = Math.floor(clock / 60);
        seconds = clock % 60;
    } else {
        seconds = clock;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }
    $('#clock').html(minutes + ':' + seconds);
};

var changeRoom = function changeRoom(room) {
    //check if the clicked room is already active
    if ($('#' + room).hasClass('active')) {
        return;
    }
    //change clicked room to active and remove active on all other
    $('#math').removeClass('active');
    $('#code').removeClass('active');
    $('#science').removeClass('active');

    $('#' + room).addClass('active');

    // add user to the chat room and load different partial

    socket.emit('joinRoom', room);
    $('#chat-Toggle').css('display', 'initial');
    $('#instruc-toggle').css('display', 'none');
};

$('#true-message-field').focusin(function (e) {
    $('#true-message-field').keypress(function (e) {
        if (e.which === 13) {
            var data = {
                message: $('#true-message-field').val(),
                name: account
            };
            $('#true-message-field').val("");
            socket.emit('newMessage', data);
        }
    });
});
"use strict";

var placeholder = "MESSAGE DATA FROM SOCKET IO WILL LOAD IN HERE";
var data = {
    userName: "fakeGuy",
    message: "I really wish this had functionality yet"
};
var timer = void 0;
var clock = 0;
/*
const init = () =>{
    socket = io.connect();
    socket.on('incomingM', onMessage);
    $('#math').click(()=>{changeRoom('math')});
    $('#code').click(()=>{changeRoom('code')});
    $('#science').click(()=>{changeRoom('science')});
}

//setInterval(() =>{onMessage(data)}, 5000);

$(document).ready(init);
*/
