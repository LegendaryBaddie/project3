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
    var message = '<h3>' + data.name + '</h3>';
    message += '<p>' + data.content + '</p>';
    $('#chat-container').append('<div class=message>' + message + '</div>');
    messages[data.id] = data;
};
var setRoomState = function setRoomState(data) {
    roomState = data;
};
var sendQuestion = function sendQuestion() {
    var question = $('#modal-question').val();
    socket.emit('newQuestion', question);
};
var questionModal = function questionModal() {
    if (roomState === 'notJoined') {
        //return;
    }
    $('#questionModal').css('display', 'block');
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
    $('#askButton').css('display', 'block');
};

$('#true-message-field').focusin(function (e) {
    $('#true-message-field').keypress(function (e) {
        if (e.which === 13 && $('#true-message-field').val() !== '') {
            var data = {
                message: $('#true-message-field').val(),
                name: account
            };
            $('#true-message-field').val("");
            socket.emit('newMessage', data);
        }
    });
});
'use strict';

var timer = void 0;
var clock = 0;
var socket = void 0;
var messages = {};
// set up states for the room you are in can be
// not joined, question in progress, no question
var roomState = 'notJoined';

var init = function init() {
    socket = io.connect();
    socket.on('msgFromServer', onMessage);
    socket.on('roomStateUpdate', setRoomState);
    $('#math').click(function () {
        changeRoom('math');
    });
    $('#code').click(function () {
        changeRoom('code');
    });
    $('#science').click(function () {
        changeRoom('science');
    });
    $('#askButton').click(questionModal);
    $('#modal-submit').click(sendQuestion);
    $(window).click(function (e) {
        if (e.target.id === 'questionModal') {
            $('#questionModal').css('display', 'none');
        }
    });
};

//setInterval(() =>{onMessage(data)}, 5000);

$(document).ready(init);
