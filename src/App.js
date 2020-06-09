import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import SendSVG from './svg/Send';

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
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState("...");
  const [usersOn, setUsersOn] = useState(0);
  const messageContainer = useRef(null);
  const notificationSound = useRef(null);

  useEffect(() => {
    if (!awsSocket) {
      // awsSocket = new WebSocket("wss://mt57ra0zm9.execute-api.us-east-1.amazonaws.com/prod");
      awsSocket = new WebSocket("ws://localhost:3001");
      
      awsSocket.onopen = () => {
        awsSocket.send(JSON.stringify({ "action": "status" }));
        awsSocket.send(JSON.stringify({ "action": "name_request" }));
      }
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
            setMessages(prev => [...prev, { sender: message.sender, content: message.content }]);
        }
      };
      awsSocket.onerror = (error) => console.log("Error occured", error);
    }
  }, [setMessages, setUsersOn]);

  useEffect(() => {
    if (autoScroll) messageContainer.current.scrollTop = messageContainer.current.scrollHeight;
    if (messages.length > 0 && messages[messages.length - 1].sender !== user) playSound(notificationSound.current)
  }, [messages, user]);

  const changeHandler = (e) => {
    setMessage(e.target.value);
  }

  const submitHandler = (e) => {
    e.preventDefault();
    awsSocket.send(JSON.stringify({ "message": message, "action": "message" }));
    setMessage("");
  }

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <h1>Your ID is <span className="underline">{user}</span></h1>
          <h2>There are currently <span className="underline">{usersOn}</span> user(s) in the chat.</h2>
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
    </div >
  );
}

export default App;
