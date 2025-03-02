import React, { useState, useEffect, useRef, useContext } from "react";
import { DataContext } from "../../context/DataContext";
import './chat.less'

const Chat = () => {
    // Holds all messages
    const [messages, setMessages] = useState([]);

    // Holds the current message being typed
    const [message, setMessage] = useState("");



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
      };


      // Receives the messages from the web socket server
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
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
        message,
        action: "send_message"
      };
      wsRef.current.send(JSON.stringify(data));
      setMessage("");
    };



    return (
      <div className="chat-container">

        <h2>Chat</h2>
        <div className="chat">
          {
            messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.username}:</strong> {msg.message}
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
