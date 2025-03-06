import { useParams } from "react-router-dom";
import { TbSend } from "react-icons/tb";
import { useState } from "react";

const TypeMessage = ({ wsRef }) => {
    // Holds the chat
    const { username } = useParams()



    // Holds the current message being typed
    const [message, setMessage] = useState("");



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
        <form className="type-message-form" onSubmit={(e) => sendMessage(e)}>
            <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <button className="btn" type="submit">
                <TbSend className="icon" />
            </button>
        </form>
    )
}

export default TypeMessage