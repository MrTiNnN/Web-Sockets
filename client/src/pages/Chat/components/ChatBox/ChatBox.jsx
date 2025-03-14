import { useParams } from "react-router-dom"
import Message from "../../../../components/Message/Message"
import InfiniteScroll from 'react-infinite-scroll-component'
import { useEffect, useRef } from "react"

const ChatBox = ({ messages, wsRef }) => {
    // Holds the chat
    const { username } = useParams()



    // Stores the chat box
    const chatRef = useRef()



    // Maintains the scroll position when we load more messages
    const prevHeightRef = useRef(0)
    useEffect(() => {
        if(messages.length) {
            chatRef.current.scrollTop += chatRef.current.scrollHeight - prevHeightRef.current
            prevHeightRef.current = chatRef.current.scrollHeight
        }
    }, [messages.length])



    // Loads more messages
    const handleLoadMore = (last_message_id) => {
        console.log("LOADING MORE")
        console.log(last_message_id)

        if(last_message_id) {
            wsRef.current.send(JSON.stringify({
                action: "load_more_messages",
                recipient: username,
                last_message_id
            }))
        }
    }



    return (
        messages && messages.length > 0 &&
        <div className="chat-box" onScroll={() => chatRef.current.scrollTop == 0 ? handleLoadMore(messages[0].id) : null} ref={chatRef}>
            {
                messages.map((msg, index) => (
                msg.type === "message" ?
                <Message
                    key={index}
                    message={msg.message}
                    type={msg.sender__username === username ? "in" : "out"}
                />
                :
                msg.type === "join" || msg.type === "error" ?
                <p key={index} className="join-msg">{msg.message}</p>
                :
                null
                ))
            }
        </div>
    )
}

export default ChatBox