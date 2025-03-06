import React, { useState, useEffect, useRef, useContext } from "react";
import { DataContext } from "../../context/DataContext";
import './chat.less'
import { useParams } from "react-router-dom";
import TitleBox from "./components/TitleBox/TitleBox";
import ChatBox from "./components/ChatBox/ChatBox";
import TypeMessage from "./components/TypeMessage/TypeMessage";

const Chat = () => {
    // Holds the chat
    const { username } = useParams()

    // Holds all messages
    const [messages, setMessages] = useState([]);

    // Holds the error state for the chat
    const [error, setError] = useState(null)



    // Gets global data from the context
    const { access } = useContext(DataContext)



    // Stores the web socket connection
    const wsRef = useRef(null);



    // Connects the web socket server
    useEffect(() => {
      if(!wsRef.current || !wsRef.current.readyState) {
        wsRef.current = new WebSocket(`ws://localhost:8000/ws/chat/?token=${access}`);
      }
      

      // Logs the successful connection
      wsRef.current.onopen = () => {
        console.log("Connected to WebSocket");

        setMessages([])

        wsRef.current.send(JSON.stringify({
          action: "join_friend_chat",
          recipient: username
        }))
      };


      // Receives the messages from the web socket server
      wsRef.current.onmessage = (event) => {
        // Parses the data
        const data = JSON.parse(event.data)
        console.log(data)

        // Handles join message
        if(data.action === "join_friend_chat") {
          const data = {
            action: "load_more_messages",
            recipient: username,
            last_message_id: -1
          }
          wsRef.current.send(JSON.stringify(data))
          console.log(data)
          // setMessages((prev) => [...prev, { message: data.message, type: "join" }])
        }

        // Handles new message
        if(data.action === "chat_message_private") {
          setMessages((prev) => [...prev, { message: data.message, sender__username: data.username, type: "message" }])
        }
        
        // Handles loading more messages
        if(data.action && data.action === "load_more_messages") {
          const newMessages = data.messages.map(currMessage => {
            return {
              ...currMessage,
              type: "message"
            }
          })
          setMessages((prev) => [...newMessages, ...prev])
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



    // Handles page change
    useEffect(() => {
      // if(wsRef.current) {
      //   wsRef.current.send(JSON.stringify({
      //     action: "join_friend_chat",
      //     recipient: username
      //   }))
      // }
      // console.log(wsRef.current.readyState)
      if(wsRef.current.readyState) window.location.reload()
    }, [username])



    return (
      <>
        {
          error ?
          <p>{error}</p>
          :
          <div className="chat-container">

            <TitleBox />

            <div className="chat">
              <ChatBox
                wsRef={wsRef}
                messages={messages}
              />

              <TypeMessage
                wsRef={wsRef}
              />
            </div>

          </div>   
        }
      </>
    );
};

export default Chat;
