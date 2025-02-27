import React, { useState, useEffect, useRef } from "react";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access")  
  
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket(`ws://localhost:8000/ws/chat/?token=${token}`);
    
    wsRef.current.onopen = () => {
      console.log("Connected to WebSocket");
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      wsRef.current.close();
    };
  }, [token]);

  const sendMessage = () => {
    if (message.trim() === "") return;
    
    const data = { message };
    wsRef.current.send(JSON.stringify(data));
    setMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chat</h2>
      <div 
        style={{ 
          border: "1px solid #ccc", 
          height: "300px", 
          overflowY: "scroll", 
          marginBottom: "10px", 
          padding: "10px" 
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.username}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "80%", padding: "10px" }}
      />
      <button onClick={sendMessage} style={{ padding: "10px" }}>Send</button>
    </div>
  );
};

export default Chat;
