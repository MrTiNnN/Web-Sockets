import { useParams } from "react-router-dom"
import Message from "../../../../components/Message/Message"

const ChatBox = ({ handleLoadMore, messages, chatRef }) => {
    // Holds the chat
    const { username } = useParams()



    return (
        <div className="chat-box" onScroll={() => handleLoadMore(messages[0].id)} ref={chatRef}>
            {
                messages.map((msg, index) => (
                msg.type === "message" ?
                <Message
                    key={index}
                    message={msg.message}
                    type={msg.sender__username === username ? "in" : "out"}
                />
                :
                msg.type === "join" ?
                <p key={index} className="join-msg">{msg.message}</p>
                :
                null
                ))
            }
        </div>
    )
}

export default ChatBox