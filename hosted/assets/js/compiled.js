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

$('#true-message-field').focusin(function (e) {
    $('#true-message-field').keypress(function (e) {
        if (e.which === 13) {
            data.message = $('#true-message-field').val();
            $('#true-message-field').val("");
            onMessage(data);
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

var init = function init() {
    newTimer(100);
};

//setInterval(() =>{onMessage(data)}, 5000);

$(document).ready(init);
