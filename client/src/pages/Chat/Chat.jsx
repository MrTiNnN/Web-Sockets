import { useEffect, useState } from "react"

const Chat = () => {
    // Stores the messages
    const [messages, setMessages] = useState([])

    // Stores the message being typed
    const [currMessage, setCurrMessage] = useState('')



    // Creates a web socket connection
    const socketServer = new WebSocket("ws://127.0.0.1:7000/ws/chat/")
    useEffect(() => {
        console.log(socketServer)
    }, [socketServer])



    // Sends a message through the web sockets
    const handleSendMessage = () => {
            socketServer.send(currMessage)
            setCurrMessage('')
    }



    return (
        <>
            <input
                value={currMessage}
                onChange={(e) => setCurrMessage(e.target.value)}
            />
            <button>Send</button>

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