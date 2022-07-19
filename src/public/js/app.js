const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
///////////////////////////////
const nick = document.getElementById("nickname");
const nickForm = nick.querySelector("form");

nickForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.emit("nickname", input.value);
});
//////////////////////////////
room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("h6");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  h3.style = "text-align:center;";
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  //h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user}이 link start 하였습니다.`);
});

socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  addMessage(`${left} left ㅠㅠ`);
});

socket.on("new_message", addMessage);

/////////////////////////////////////////////////
socket.on("send_yuor_time", () => {
  const video_stop = document.getElementById("asd");
  const now_time = video_stop.currentTime;
  console.log(111);
  console.log(now_time);
  socket.emit("give_time", now_time);
});

socket.on("same_state", (time__) => {
  const video_stop = document.getElementById("asd");
  video_stop.currentTime = time__;
  video_stop.play();
});

socket.on("pause2", () => {
  const video_stop = document.getElementById("asd");
  video_stop.pause();
});

socket.on("start2", () => {
  const video_stop = document.getElementById("asd");
  video_stop.play();
})
///////////////////////////////////////////////


/*
const video_control = document.getElementById("video_start");
video_control.addEventListener("submit", (e) => {
  e.preventDefault();
  const video_stop = document.getElementById("asd");
  video_stop.pause();
});
*/
const video_control_pause = document.getElementById("pause");
video_control_pause.addEventListener("click", (e) => {
  e.preventDefault();
  const video_stop = document.getElementById("asd");
  video_stop.pause();
  socket.emit("pause1");
})
const video_control_skip = document.getElementById("skip");
video_control_skip.addEventListener("click", (e) => {
  e.preventDefault();
  const video_stop = document.getElementById("asd");
  //console.log(video_stop.currentTime);//현재 시간 뽑기
  socket.emit("choose_time", video_stop.currentTime);
})
const video_control_start = document.getElementById("start");
video_control_start.addEventListener("click", (e) => {
  e.preventDefault();
  const video_stop = document.getElementById("asd");
  video_stop.play();
  socket.emit("start1");
})