import React, { useState, useEffect, useRef, useContext } from "react";
import { DataContext } from "../../context/DataContext";
import './chat.less'
import { useParams } from "react-router-dom";

const Chat = () => {
    // Holds the chat
    const { username } = useParams()

    // Holds all messages
    const [messages, setMessages] = useState([]);

    // Holds the current message being typed
    const [message, setMessage] = useState("");

    // Holds the error state for the chat
    const [error, setError] = useState(null)



    // Gets global data from the context
    const { access } = useContext(DataContext)



    // Stores the web socket connection
    const wsRef = useRef(null);



    // Connects the web socket server
    useEffect(() => {
      wsRef.current = new WebSocket(`ws://localhost:8000/ws/chat/?token=${access}`);
      

      // Logs the successful connection
      wsRef.current.onopen = () => {
        console.log("Connected to WebSocket");

        wsRef.current.send(JSON.stringify({
          action: "join_friend_chat",
          recipient: username
        }))
      };


      // Receives the messages from the web socket server
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data)
        if(data.message) setMessages((prev) => [...prev, data]);
        else if(data.error) setError(data.error)
      };


      // Logs the closed connection
      wsRef.current.onclose = () => {
        console.log("WebSocket connection closed");
      };


      // Closes the connection
      return () => {
        wsRef.current.close();
      };
    }, [access]);



    // Sends a message
    const sendMessage = (e) => {
      e.preventDefault()

      if(message.trim() === "") return;
      
      const data = { 
        action: "send_message",
        message,
        recipient: username
      };
      console.log(data)
      wsRef.current.send(JSON.stringify(data));
      setMessage("");
    };



    return (
      error ?
      <p>{error}</p>
      :
      <div className="chat-container">

        <h1>{username}</h1>
        <div className="chat">
          {
            messages.map((msg, index) => (
              <div key={index}>
                {msg.username && <strong>{msg.username}: </strong>}
                {msg.message}
              </div>
            ))
          }
        </div>

        <form onSubmit={(e) => sendMessage(e)}>
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit">Send</button>
        </form>

      </div>
    );
};

export default Chat;
