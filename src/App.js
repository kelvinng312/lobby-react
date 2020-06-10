import React, { useState, useEffect, useRef } from "react";
import Button from "@material-ui/core/Button";
import { createMuiTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import "./App.css";
import SendSVG from "./svg/Send";
import PlayerList from "./components/PlayerList";

const theme = createMuiTheme();

/*

http://websocket.org/echo.html
wss://mt57ra0zm9.execute-api.us-east-1.amazonaws.com/prod
{"action": "message", "message": "test"}

*/

let awsSocket = null;
let autoScroll = true;

function scrollHandler(e) {
  if (e.target.clientHeight + e.target.scrollTop + 200 >= e.target.scrollHeight) autoScroll = true;
  else autoScroll = false;
}

function playSound(soundElement) {
  soundElement.currentTime = 0;
  soundElement.play();
}

function App() {
  const [isStarted, setStarted] = useState(false);
  const [status, setStatus] = useState("Not Started");
  const [users, setUsers] = useState([]);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState("...");
  const [usersOn, setUsersOn] = useState(0);
  const messageContainer = useRef(null);
  const notificationSound = useRef(null);

  useEffect(() => {
    if (!awsSocket) {
      // awsSocket = new WebSocket("wss://mt57ra0zm9.execute-api.us-east-1.amazonaws.com/prod");
      // awsSocket = new WebSocket("ws://localhost:3001");
      awsSocket = new WebSocket("wss://bcxf3ewhj8.execute-api.us-east-1.amazonaws.com/dev");

      awsSocket.onopen = () => {
        awsSocket.send(JSON.stringify({ action: "status" }));
        awsSocket.send(JSON.stringify({ action: "name_request" }));

        // for testing
        setUsers([
          { name: "Player 1", color: "success", status: "Not started" },
          { name: "Player 2", color: "danger", status: "Searching" },
        ]);
      };
      awsSocket.onclose = () => console.log("Socket closed");
      awsSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case "request":
            setUser(message.content);
            break;
          case "status":
            setUsersOn(message.content);
            break;
          default:
            setMessages((prev) => [...prev, { sender: message.sender, content: message.content }]);
        }
      };
      awsSocket.onerror = (error) => console.log("Error occured", error);
    }
  }, [setMessages, setUsersOn]);

  useEffect(() => {
    if (autoScroll) messageContainer.current.scrollTop = messageContainer.current.scrollHeight;
    if (messages.length > 0 && messages[messages.length - 1].sender !== user) playSound(notificationSound.current);
  }, [messages, user]);

  const changeHandler = (e) => {
    setMessage(e.target.value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    awsSocket.send(JSON.stringify({ message: message, action: "message" }));
    setMessage("");
  };

  const startOrCancelMatch = (e) => {
    console.log("clicked start/stop button.");

    setStarted(!isStarted);

    if (isStarted) {
      setStatus("Not started.");
    } else {
      setStatus("Searching...");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <div className="chat-container">
          <div className="chat-header">
            <h1>
              Your ID is <span className="underline">{user}</span>
            </h1>
            <h2>
              There are currently <span className="underline">{usersOn}</span> user(s) in the chat.
            </h2>
          </div>

          <div className="button-group">
            <Button variant="contained" style={{ width: "120px" }} color={isStarted ? "secondary" : "primary"} onClick={startOrCancelMatch}>
              {isStarted ? "Cancel" : "Start 1v1"}
            </Button>

            <span className="status-text">{status}</span>
          </div>

          <div className="button-group">
            <PlayerList users={users} />
          </div>

          <div className="chat-body" ref={messageContainer} onScroll={(e) => scrollHandler(e, setMessages)} data-testid="chat-body">
            <ul data-testid="chat-ul">
              {messages.map((msg, i) => (
                <li className={user === msg.sender ? "message you" : "message"} key={"msg-" + i}>
                  <span className="message-sender">{msg.sender}</span>
                  <span className="message-content">{msg.content}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="chat-footer">
            <form className="chat-form" onSubmit={submitHandler}>
              <input type="text" placeholder="Your message..." value={message} onChange={changeHandler} required />
              <label className="label-submit">
                <input style={{ display: "none" }} type="submit" />
                <SendSVG />
              </label>
            </form>
          </div>
        </div>
        <audio ref={notificationSound} src="notification.mp3" preload="auto"></audio>
      </div>
    </ThemeProvider>
  );
}

export default App;
