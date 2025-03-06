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
      };


      // Receives the messages from the web socket server
      wsRef.current.onmessage = (event) => {
        // Parses the data
        const data = JSON.parse(event.data)
        console.log(data)

        // Handles join message
        if(data.action === "join_friend_chat") {
          handleLoadMore(0)
          setMessages((prev) => [...prev, { message: data.message, type: "join" }])
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
                handleLoadMore={handleLoadMore}
                messages={messages}
                chatRef={chatRef}
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
