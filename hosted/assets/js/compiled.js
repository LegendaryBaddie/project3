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
    $('#chat-container').append('<div class=message><div class=content>' + message + '</div><div class=merit onClick=sendMerit(this) id=' + data.id + '><h3>' + data.stars + '</h3></div></div>');
    messages[data.id] = data;
};
var setQuestion = function setQuestion(data) {
    $('#the-question').html(data.content);
    newTimer(data.time);
    $('#true-message-field').removeAttr('disabled');
};
var queueDisplay = function queueDisplay(data) {
    $('#queue-count').html('Questions in Queue:' + data);
};
var sendMerit = function sendMerit(data) {
    //check if the person clicking owns the message
    if (messages[data.id].name === account) {
        return;
    }
    socket.emit('addMerit', data.id);
};
var sendQuestion = function sendQuestion() {
    var question = $('#modal-question').val();
    socket.emit('newQuestion', question);
};
var resetQuestion = function resetQuestion() {
    $('#the-question').html("Waiting for a Question");
    $('#clock').html('0:00');
    $('#chat-containter').empty();
    // disable sending messages 
    $('#true-message-field').attr('disabled', 'true');
};
var questionModal = function questionModal() {
    $('#questionModal').css('display', 'block');
};
var newTimer = function newTimer(length) {
    clearInterval(timer);
    clock = Math.floor(length / 1000);
    timer = setInterval(updateClock, 1000);
};
var setRoomMessages = function setRoomMessages(data) {
    //clear all messsages first
    $('#chat-container').empty();
    messages = {};
    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
        onMessage(data[keys[i]]);
    }
};
var updateClock = function updateClock() {
    clock -= 1;
    if (clock == 0) {
        clearInterval(timer);
        $('#clock').html('0:00');
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

    // add user to the chat room and reset chatbox;

    $('#the-question').html('No Question Asked');
    $('#clock').html('0:00');
    $('#chat-container').html('');
    $('#true-message-field').val('');
    $('#chat-Toggle').css('display', 'initial');
    $('#instruc-toggle').css('display', 'none');
    $('#askButton').css('display', 'block');
    $('#queue-box').css('display', 'block');
    clearInterval(timer);
    clock = 0;
    socket.emit('joinRoom', room);
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

var init = function init() {
    socket = io.connect();
    socket.on('msgFromServer', onMessage);
    socket.on('newQuestion', setQuestion);
    socket.on('allMessages', setRoomMessages);
    socket.on('resetQuestion', resetQuestion);
    socket.on('queueUpdate', queueDisplay);
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
