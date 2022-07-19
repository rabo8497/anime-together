import http from "http";
import express from "express";
import { instrument } from '@socket.io/admin-ui';
import { Server } from "socket.io";

const port = process.env.PORT;
//import WebSocket from "ws";
const app = express();
var time_now = 0;

app.set("view engine", "pug"); //확장자 지정
app.set("views", __dirname + "/views"); //폴더 경로 지정
// => 해당 폴거에서 확장자가 pug인걸 고르겠다는 의미
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/")); // 주소 뒤에 어떤 것이 와도 home으로

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});
instrument(wsServer, {
   auth: false, 
});

function publicRooms() {
    const {
        sockets: {
            adapter: { sids, rooms },
        },
    } =wsServer;
    const publicRooms = [];
    rooms.forEach((_,key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName).size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
        console.log(`Socket Event:${event}`);
    }); //소켓 이벤트를 찾는다
    socket.on("enter_room", (roomName, done) => {
        //////////////////////////////////////////////////////////////////
        //wsServer.sockets.emit("send_yuor_time");
        //////////////////////////////////////////////////////////////////
        socket.join(roomName);
        //console.log(socket.rooms);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));//방에 있는 모두에게 보내기
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));
    });
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => {
        socket["nickname"] = nickname;
    });
    ////////////////////////////////////////////
    socket.on("give_time", (time_) => {
        console.log(time_);
        time_now = time_;
        socket.broadcast.emit("same_state", time_now);
    })
    socket.on("choose_time", () => {
        socket.broadcast.emit("send_yuor_time");
    })
    socket.on("pause1", () => {
        socket.broadcast.emit("pause2");
    })
    socket.on("start1", () => {
        socket.broadcast.emit("start2");
    })
    ////////////////////////////////////////////
});


httpServer.listen(10031, () => console.log(10000)); //서버 시작
