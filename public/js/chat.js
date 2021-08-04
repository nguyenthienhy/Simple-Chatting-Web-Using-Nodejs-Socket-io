$(document).ready(function () {
    function openStream() {
        const config = { audio: true, video: true };
        return navigator.mediaDevices.getUserMedia(config);
    }
    function playStream(idVideoTag, stream) {
        const video = document.getElementById(idVideoTag);
        video.srcObject = stream;
        video.play();
    }
    var socket = io("http://localhost:3000/:id");
    $("#temp").hide();
    $("#frameVideoCall").hide();
    $("#frameChat").hide();
    $("#listFriend").hide();
    socket.on("server-send-info-socket-to-client", function (data) {
        $("#peerID").attr("value", data.peerId);
    });
    socket.on("server-send-list", function (data) {
        $("#listFriend").html("");
        $("#listFriend_online").html("");
        data.forEach(function (i) {
            if (i.name != $("#name").val()) {
                $("#listFriend").append("<ui id='peerIDUSER' class='nameUSER'>" + "<li class='temp'>" + "<div class='d-flex bd-highlight'>"
                    + "<div class='img_cont'>" + "<img src='' class='rounded-circle user_img' id='image_user'>"
                    + "<span class='online_icon'>" + "</span>" + "</div>" + "<div class='user_info'>" + "<span>" + i.name + "</span>" +
                    "<p>" + i.name + " đang online" + "</p>" + "</div>" + "</div>" + "</li>" + "</ui>");
                $("#peerIDUSER").attr('id', i.peerId);
                $(".nameUSER").attr('class', i.name);
                $("#image_user").attr("src" , "../uploads/" + i.avatar);
                $("#image_user").attr("id" , "../uploads/" + i.avatar);
            }
        });
        data.forEach(function (i) {
            if (i.name != $("#name").val()) {
                $("#listFriend_online").append("<ui name='peerIDUSER' class='nameUSER'>" + "<li>" + "<div class='d-flex bd-highlight'>"
                    + "<div class='img_cont'>" + "<img src='' class='rounded-circle user_img' id='image_user'>"
                    + "<span class='online_icon'>" + "</span>" + "</div>" + "<div class='user_info'>" + "<span>" + i.name + "</span>" +
                    "<p>" + i.name + " đang online" + "</p>" + "</div>" + "</div>" + "</li>" + "</ui>");
                $("#peerIDUSER").attr('name', i.peerId);
                $(".nameUSER").attr('class', i.name);
                $("#image_user").attr("src" , "../uploads/" + i.avatar);
                $("#image_user").attr("id" , "../uploads/" + i.avatar);
            }
        });
    });
    socket.on("server-send-your-message", function (data) {
        $("#placeChat").append("<div class='d-flex justify-content-end mb-4' id='message_send'>" +
            "<div class='img_cont_msg'>" +
            "<img src='' class='rounded-circle user_img_msg' id='image_message'>" +
            "</div>" +
            "<div class='msg_cotainer_send'>" + data.nd
            + "<span class='msg_time_send'>" + "</span>" +
            "</div>" +
            "</div>");
            $("#image_message").attr("src" , "../uploads/" + data.avatar);
            $("#image_message").attr("id" , "../uploads/" + data.avatar);
    });
    socket.on("send-list-message-1", function (data) {
        $("#placeChat").append("<div class='d-flex justify-content-end mb-4' id='message_recv'>" +
            "<div class='img_cont_msg'>" +
            "<img src='' class='rounded-circle user_img_msg' id='image_message'>" +
            "</div>" +
            "<div class='msg_cotainer_send'>" + data.mes_send
            + "<span class='msg_time_send'>" + "</span>" +
            "</div>" +
            "</div>");
        $("#image_message").attr("src", "../uploads/" + data.avatar_send);
        $("#image_message").attr("id", "../uploads/" + data.avatar_send);
        $("#placeChat").append("<div class='d-flex justify-content-start mb-4' id='message_recv'>" +
            "<div class='img_cont_msg'>" +
            "<img src='' class='rounded-circle user_img_msg' id='image_message'>" +
            "</div>" +
            "<div class='msg_cotainer'>" + data.mes_recv
            + "<span class='msg_time'>" + "</span>" +
            "</div>" +
            "</div>");
        $("#image_message").attr("src", "../uploads/" + data.avatar_recv);
        $("#image_message").attr("id", "../uploads/" + data.avatar_recv);
    });
    socket.on("send-list-message-2", function (data) {
        $("#placeChat").append("<div class='d-flex justify-content-start mb-4' id='message_recv'>" +
            "<div class='img_cont_msg'>" +
            "<img src='' class='rounded-circle user_img_msg' id='image_message'>" +
            "</div>" +
            "<div class='msg_cotainer'>" + data.mes_recv
            + "<span class='msg_time'>" + "</span>" +
            "</div>" +
            "</div>");
        $("#image_message").attr("src", "../uploads/" + data.avatar_recv);
        $("#image_message").attr("id", "../uploads/" + data.avatar_recv);
        $("#placeChat").append("<div class='d-flex justify-content-end mb-4' id='message_recv'>" +
            "<div class='img_cont_msg'>" +
            "<img src='' class='rounded-circle user_img_msg' id='image_message'>" +
            "</div>" +
            "<div class='msg_cotainer_send'>" + data.mes_send
            + "<span class='msg_time_send'>" + "</span>" +
            "</div>" +
            "</div>");
        $("#image_message").attr("src", "../uploads/" + data.avatar_send);
        $("#image_message").attr("id", "../uploads/" + data.avatar_send);
    });
    socket.on("send-list-message-3", function (data) {
        $("#placeChat").append("<div class='d-flex justify-content-end mb-4' id='message_recv'>" +
            "<div class='img_cont_msg'>" +
            "<img src='' class='rounded-circle user_img_msg' id='image_message'>" +
            "</div>" +
            "<div class='msg_cotainer_send'>" + data.mes_send
            + "<span class='msg_time_send'>" + "</span>" +
            "</div>" +
            "</div>");
        $("#image_message").attr("src", "../uploads/" + data.avatar_send);
        $("#image_message").attr("id", "../uploads/" + data.avatar_send);
    });
    socket.on("send-list-message-4", function (data) {
        $("#placeChat").append("<div class='d-flex justify-content-start mb-4' id='message_recv'>" +
            "<div class='img_cont_msg'>" +
            "<img src='' class='rounded-circle user_img_msg' id='image_message'>" +
            "</div>" +
            "<div class='msg_cotainer'>" + data.mes_recv
            + "<span class='msg_time'>" + "</span>" +
            "</div>" +
            "</div>");
        $("#image_message").attr("src", "../uploads/" + data.avatar_recv);
        $("#image_message").attr("id", "../uploads/" + data.avatar_recv);
    });
    socket.on("server-send-message", function (data) {
        if($("#nameUserInBoxChat").html() === data.nameSent){
            $("#placeChat").append("<div class='d-flex justify-content-start mb-4' id='message_recv'>" +
            "<div class='img_cont_msg'>" +
            "<img src='' class='rounded-circle user_img_msg' id='image_message'>" +
            "</div>" +
            "<div class='msg_cotainer'>" + data.nd
            + "<span class='msg_time'>" + "</span>" +
            "</div>" +
            "</div>");
            $("#image_message").attr("src" , "../uploads/" + data.avatar);
            $("#image_message").attr("id" , "../uploads/" + data.avatar);
        }
    });
    socket.on('client-is-disconected', peerId => {
        $(`#${peerId}`).remove();

    });
    
    $("#logout").click(function () {
        socket.emit("logout");
    });
    $('#listFriend').on('click', 'ui', function () {
        $("#placeChat").html("");
        const nameUser = $(this).attr('class');
        const id = $(this).attr('id');
        $("#nameUserInBoxChat").html(nameUser);
        socket.emit("change-avatar" , nameUser);
        const avatar = $('#image').val();
        socket.emit("get-list-message" , {
            nameSend: $("#name").val(),
            nameRecv: nameUser,
            avatar: avatar
        });
        $("#peerID").attr('value', id);
        $("#frameChat").show();
    });
    $('#listFriend_online').on('click', 'ui', function () {
        const nameUser = $(this).attr('class');
        const id = $(this).attr('name');
        $("#nameUserInBoxChat").html(nameUser);
        socket.emit("change-avatar" , nameUser);
        const avatar = $('#image').val();
        socket.emit("get-list-message" , {
            nameSend: $("#name").val(),
            nameRecv: nameUser,
            avatar: avatar
        });
        $("#peerID").attr('value', id);
        $("#listFriend").show();
        $("#listFriend_online").hide();
        $("#frameChat").show();
    });
    socket.on("ok-change-avatar" , function(data){
        $("#user_img").attr("src" , "../uploads/" + data);
    })
    $("#send").click(function () {
        var nameRecv = $("#nameUserInBoxChat").html();
        var namesent = $("#name").val();
        const avatar = $('#image').val();
        socket.emit("client-send-message", { mes: $("#txtMessage").val(), nameRecv: nameRecv , nameSend: namesent , avatar: avatar});
        document.getElementById('txtMessage').value=''; 
    });
    $("#txtMessage").keypress(function (event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            var nameRecv = $("#nameUserInBoxChat").html();
            var namesent = $("#name").val();
            const avatar = $('#image').val();
            socket.emit("client-send-message", { mes: $("#txtMessage").val(), nameRecv: nameRecv , nameSend: namesent , avatar: avatar});
            document.getElementById('txtMessage').value=''; 
        }
    });
    $('#action_menu_btn').click(function () {
        $('.action_menu').toggle();
    });

    var peer = new Peer({ key: 'lwjd5qra8257b9' });
    peer.on('open', function (id) {
        const username = $('#name').val();
        const avatar = $('#image').val();
        socket.emit('client-req-list-users-online', { name: username, peerId: id , avatar: avatar});
    });

    //Caller
    $('#callVideo').click(function () {
        socket.emit("client-call-video");
        const id = $('#peerID').val();
        $("#frameVideoCall").show();
        $("#frameMsg").hide();
        openStream()
            .then(function (stream) {
                playStream('localStream', stream);
                const call = peer.call(id, stream);
                call.on('stream', function (remoteStream) {
                    playStream('remoteStream', remoteStream)
                });
            });
    });

    //Listener
    peer.on('call', function (call) {
        $("#frameVideoCall").show();
        $("#frameMsg").hide();
        openStream()
            .then(function (stream) {
                call.answer(stream);
                playStream('localStream', stream);
                call.on('stream', function (remoteStream) {
                    playStream('remoteStream', remoteStream)
                });
            });
    });
});