import React, { useState, useEffect, useRef, useContext } from "react";
import { DataContext } from "../../context/DataContext";
import './chat.less'
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";

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



    useEffect(() => {
      if(messages.length <= 51) chatRef.current.scrollTop = chatRef.current.scrollHeight
    }, [messages.length])



    // Stores the chat box
    const chatRef = useRef()
    const [chatScroll, setChatScroll] = useState(0)

    useEffect(() => {
      console.log(chatScroll)
    }, [chatScroll]) 



    // Loads more messages
    const handleLoadMore = (last_message_id) => {

      if(chatRef.current.scrollTop == 0) {

        wsRef.current.send(JSON.stringify({
          action: "load_more_messages",
          recipient: username,
          last_message_id
        }))

      }

    }



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

        handleLoadMore(0)
      };


      // Receives the messages from the web socket server
      wsRef.current.onmessage = (event) => {
        // Parses the data
        const data = JSON.parse(event.data)
        console.log(data)

        // Handles new message
        if(data.message) {
          // console.log({ message: data.message, sender__username: data.username })
          setMessages((prev) => [...prev, { message: data.message, sender__username: data.username }])
          // chatRef.current.scrollTop = chatRef.current.scrollHeight
        }
        
        // Handles loading more messages
        if(data.action && data.action === "load_more_messages") {
          setMessages((prev) => [...data.messages, ...prev])
          if(messages.length > 51) {
            setChatScroll(chatRef.current.scrollTop)
            // chatRef.current.scrollTop = chatRef.current.scrollHeight
            // console.log(chatRef.current.children.length)
            // console.log(chatRef.current.children[chatRef.current.children.length - 1])
          }
        }
        
        // Handles errors
        if(data.error) setError(data.error)
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
      // console.log(data)
      wsRef.current.send(JSON.stringify(data));
      setMessage("");
    };



    return (
      <>
        {
          error ?
          <p>{error}</p>
          :
          <div className="chat-container">

            <h1>{username}</h1>
            <div className="chat" onScroll={() => handleLoadMore(messages[0].id)} ref={chatRef}>
              {
                messages.map((msg, index) => (
                  <div key={index}>
                    {msg.sender__username && <strong>{msg.sender__username}: </strong>}
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
        }
      </>
    );
};

export default Chat;
