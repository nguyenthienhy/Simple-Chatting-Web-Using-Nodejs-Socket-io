var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var pg = require('pg');
var multer  = require('multer');
var arrUserInfo = [];
var room = [];
var config = {
    user: 'postgres',
    database: 'chat_web',
    password: 'hydongykute',
    host: 'localhost',
    port: 5432,
    max: 100,
    idleTimeoutMillis: 3000,
};
var pool = new pg.Pool(config);
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
});
var upload = multer({ storage: storage }).single("uploadPicture");
app.get("/", function (req, res) {
    res.render("home");
})
app.get("/login", function (req, res) {
    res.render("login");
});
app.get("/signUp", function (req, res) {
    res.render("signUp");
});
app.get("/:id", function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            return console.error("Không thể kết nối database", err);
        }
        var id = req.params.id;
        var sql = "select * from nguoidung where nguoidung.id = " + id + "";
        client.query(sql, function (err, result) {
            done();
            if (err) {
                res.end();
            }
            else {
                res.render("chat", { user: result.rows[0].name, ID: id , avatar: result.rows[0].avatar });
            }
        });
    });
});
app.get("/:id/about", function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            return console.error("Không thể kết nối database", err);
        }
        var id = req.params.id;
        var sql = "select * from nguoidung where nguoidung.id = " + id + "";
        client.query(sql, function (err, result) {
            done();
            if (err) {
                res.end();
            }
            else {
                res.render("accountInfo", 
                            {   user: result.rows[0].name, 
                                password: result.rows[0].password, 
                                ID: id, 
                                avatar: result.rows[0].avatar });
            }
        });
    });
});
app.post("/signUp", urlencodedParser, function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            res.send("Có lỗi khi đăng ký");
        }
        else{
            var len_users = 0;
            var id_users = [];
            pool.connect(function (err, client, done) {
                if (err) {
                    return console.error("Không thể kết nối database", err);
                }
                var sql = "select * from nguoidung";
                client.query(sql, function (err, result) {
                    done();
                    if (err) {
                        len_users = -1;
                        res.end();
                        return console.error('Không thể tìm thấy bảng nguoidung', err);
                    }
                    else {
                        len_users = result.rows.length
                        for (var i = 0; i < result.rows.length; i++) {
                            id_users.push(result.rows[i].id)
                        }
                    }
                });
            });
            if (len_users != -1){
                pool.connect(function (err, client, done) {
                    if (err) {
                        return console.error("Không thể kết nối database", err);
                    }
                    var id;
                    id = Math.floor(Math.random() * 1000);
                    for (var i = 0; i < len_users; i++) {
                        if (id == id_users[i]) {
                            id = Math.floor(Math.random() * 1000);
                        }
                    }
                    var sql_add_user = "insert into nguoidung (id , name , password , avatar) \
                    values( " + id + " , '" + req.body.loginName + "' , '" + req.body.loginPw + "' , '"+req.file.originalname+"')";
                    client.query(sql_add_user, function (err, result) {
                        done();
                        if (err) {
                            res.end();
                            return console.error('Không thể thêm người dùng mới', err);
                        }
                        else {
                            res.redirect("/");
                        }
                    });
                });
            }
            else{
                res.end();
                return console.error('Có lỗi hệ thống', err);
            }
        }
    });
});

app.post("/login", urlencodedParser, function (req, res) {
    pool.connect(function (err, client, done) {
        if (err) {
            return console.error("Không thể kết nối database", err);
        }
        var sql = "select * from nguoidung";
        client.query(sql, function (err, result) {
            done();
            if (err) {
                res.end();
                return console.error('Không thể tìm thấy bảng nguoidung', err);
            }
            else {
                for (var i = 0; i < result.rows.length; i++) {
                    if (result.rows[i].name == req.body.nameuser && result.rows[i].password == req.body.pwuser) {
                        res.redirect("/" + result.rows[i].id + "");
                    }
                }
            }
        });
    });
});

io.of("/:id").on("connection", function (socket) {
    socket.on('client-req-list-users-online', function (user) {
        const isExist = arrUserInfo.some(function (e) { e.name === user.name });
        socket.peerId = user.peerId;
        socket.username = user.name;
        socket.avatar = user.avatar;
        socket.join(user.name);
        room.push(user.name);
        if (isExist) return console.log("Exist User");
        arrUserInfo.push(user);
        socket.emit("server-send-info-socket-to-client", user);
        io.of("/:id").emit("server-send-list", arrUserInfo);
    });

    socket.on("logout", function () {
        const index = arrUserInfo.findIndex(function (user) { user.peerId === socket.peerId });
        arrUserInfo.splice(index, 1);
        io.of("/:id").emit('client-is-disconected', socket.peerId);
    });

    socket.on("change-avatar" , function(data){
        for(var i = 0; i < arrUserInfo.length ; i ++){
            if(arrUserInfo[i].name === data){
                socket.emit("ok-change-avatar" , arrUserInfo[i].avatar);
                break;
            }
        }
    });
    socket.on("client-send-message", function (data) {
        var len_messages = 0;
        var id_messages = [];
        pool.connect(function (err, client, done) {
            if (err) {
                return console.error("Không thể kết nối database", err);
            }
            var sql = "select * from message";
            client.query(sql, function (err, result_find) {
                done();
                if (err) {
                    len_messages = -1
                    socket.emit("fail");
                }
                else {
                    len_messages = result_find.rows.length
                    for (var i = 0; i < len_messages; i++) {
                        id_messages.push(result_find.rows[i].id)
                    }
                }
            });
        });
        pool.connect(function (err, client, done) {
            if (err) {
                return console.error("Không thể kết nối database", err);
            }
            var id;
            id = Math.floor(Math.random() * 1000);
            for (var i = 0; i < len_messages; i++) {
                if (id == id_messages[i]) {
                    id = Math.floor(Math.random() * 1000);
                }
            }
            var sql_add_mes = "insert into message(id , namesend , namerecv , avatar , mes) \
            values("+id+" , '"+data.nameSend+"' , '"+data.nameRecv+"' , '"+data.avatar+"' , '"+data.mes+"')";
            client.query(sql_add_mes , function(err){
                done();
                if (err) {
                    socket.emit("fail");
                }
                else{
                    for(var i = 0 ; i < room.length ; i ++){
                        if(room[i] === data.nameRecv){
                            socket.to(room[i]).emit("server-send-message", {nd: data.mes , nameSent: data.nameSend , avatar: data.avatar});
                            socket.emit("server-send-your-message", {nd: data.mes , avatar: data.avatar});
                            break;
                        }
                    }
                }
            });
        });
    });
    socket.on("get-list-message" , function(data){
        pool.connect(function (err, client, done) {
            if (err) {
                return console.error("Không thể kết nối database", err);
            }
            var sql = "select * from message";
            client.query(sql, function (err, result) {
                done();
                if (err) {
                    socket.emit("fail");
                }
                else {
                    if(result.rows.length === 1){
                        console.log("default message");
                    }
                    else{
                        var k = 0;
                        for(var index = 0 ; index < result.rows.length ; index ++){
                            if((result.rows[index].namesend === data.nameSend && result.rows[index].namerecv === data.nameRecv) 
                            || (result.rows[index].namerecv === data.nameSend && result.rows[index].namesend === data.nameRecv)){
                                k = index;
                                break;
                            }
                        }
                        if (result.rows[k].namesend === data.nameSend && result.rows[k].namerecv === data.nameRecv) {
                            for (var i = k; i < result.rows.length; i++) {
                                var count = 0; 
                                if(result.rows[i].namesend === data.nameSend && result.rows[i].namerecv === data.nameRecv){
                                    socket.emit("send-list-message-3" , {mes_send: result.rows[i].mes, avatar_send: result.rows[i].avatar});
                                    for (var j = i + 1; j < result.rows.length; j++) {
                                        if(result.rows[j].namesend === data.nameRecv && result.rows[j].namerecv === data.nameSend){
                                            socket.emit("send-list-message-4" , 
                                                        {mes_send: result.rows[i].mes,mes_recv: result.rows[j].mes,avatar_send: result.rows[i].avatar,avatar_recv: result.rows[j].avatar});
                                            var l = j + 1;
                                            while(l < result.rows.length){
                                                if(result.rows[l].namesend === data.nameRecv && result.rows[l].namerecv === data.nameSend){
                                                    socket.emit("send-list-message-4" , {mes_recv: result.rows[l].mes,avatar_recv: result.rows[l].avatar});
                                                }
                                                else{
                                                    break;
                                                }
                                                l ++;
                                            }
                                            break;
                                        }
                                        else if(result.rows[j].namesend === data.nameSend && result.rows[j].namerecv === data.nameRecv){
                                            socket.emit("send-list-message-3" , {mes_send: result.rows[j].mes, avatar_send: result.rows[j].avatar});
                                            count ++;
                                        } 
                                    }
                                    i = i + count;
                                } 
                            }
                        }
                        else if(result.rows[k].namesend === data.nameRecv && result.rows[k].namerecv === data.nameSend){
                            for (var i = k; i < result.rows.length; i++) {
                                var count = 0;
                                if(result.rows[i].namesend === data.nameRecv && result.rows[i].namerecv === data.nameSend){
                                    socket.emit("send-list-message-4" , {mes_recv: result.rows[i].mes, avatar_recv: result.rows[i].avatar});
                                    for (var j = i + 1; j < result.rows.length; j++) {
                                        if(result.rows[j].namesend === data.nameSend && result.rows[j].namerecv === data.nameRecv){
                                            socket.emit("send-list-message-3" , 
                                                { mes_send: result.rows[j].mes,mes_recv: result.rows[i].mes,avatar_send: result.rows[j].avatar,avatar_recv: result.rows[i].avatar});
                                            var l = j + 1;
                                            while(l < result.rows.length){
                                                if(result.rows[l].namesend === data.nameSend && result.rows[l].namerecv === data.nameRecv){
                                                    socket.emit("send-list-message-3" , { mes_send: result.rows[l].mes,avatar_send: result.rows[l].avatar});
                                                }
                                                else{
                                                    break;
                                                }
                                                l ++;
                                            }
                                            break;
                                        }
                                        else if(result.rows[j].namesend === data.nameRecv && result.rows[j].namerecv === data.nameSend){
                                            socket.emit("send-list-message-4" , {mes_recv: result.rows[j].mes, avatar_recv: result.rows[j].avatar}); 
                                            count ++;  
                                        }
                                    }
                                    i = i + count;
                                } 
                            }
                        }
                    } 
                }
            });
        });
    });
    socket.on('disconnect', function () {
        const index = arrUserInfo.findIndex(function (user) { user.peerId === socket.peerId });
        arrUserInfo.splice(index, 1);
        io.of("/:id").emit('client-is-disconected', socket.peerId);
    });

});
server.listen(process.env.PORT || 3000);