import { useEffect, useRef, useState } from "react"

const Chat = () => {
    // Stores the messages
    const [messages, setMessages] = useState([])

    // Stores the message being typed
    const currMessage = useRef()



    // Creates a web socket connection
    // useEffect(() => {
        //     console.log(socketServer)
        // }, [socketServer])
    // const socketServer = new WebSocket("ws://127.0.0.1:7000/ws/chat/")


    
    // socketServer.onopen = (e) => {
    //     socketServer.send("Welcome!")
    // }

    let socket = new WebSocket("ws://127.0.0.1:7000/ws/chat/");

    socket.onopen = function(event) {
        socket.send(JSON.stringify({ message: "Hello, server!" }));
    };

    socket.onmessage = function(event) {
        let data = JSON.parse(event.data);
        console.log(`THIS IS THE THING: ${data.message}`);
    };

    // socket.onerror = function(event) {
    //     console.error("WebSocket error:", event);
    // }


    // socketServer.onmessage = (e) => {
    //     const data = JSON.parse(e.data)
    //     console.log(data.message)
    // }



    // // Sends a message through the web sockets
    const handleSendMessage = () => {
            // console.log(currMessage.current.value)
            socket.send(JSON.stringify({message: currMessage.current.value}))
            // setCurrMessage('')
    }



    return (
        <>
            <input
                ref={currMessage}
                onChange={(e) => currMessage.current.value = e.target.value}
            />
            <button onClick={handleSendMessage}>Send</button>

            <div>
                {
                    messages.map(message => (
                        <>
                            <p>{message}</p>
                            <br />
                        </>
                    ))
                }
            </div>
        </>
    )
}

export default Chat