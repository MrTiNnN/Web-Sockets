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
        console.log(prevHeightRef.current)
        chatRef.current.scrollTop += chatRef.current.scrollHeight - prevHeightRef.current
        prevHeightRef.current = chatRef.current.scrollHeight
    }, [messages.length])



    // Loads more messages
    const handleLoadMore = (last_message_id) => {
        console.log("LOADING MORE")

        wsRef.current.send(JSON.stringify({
            action: "load_more_messages",
            recipient: username,
            last_message_id
        }))

    }



    return (
        <div className="chat-box" onScroll={() => chatRef.current.scrollTop == 0 ? handleLoadMore(messages[0].id) : null} ref={chatRef}>
        {/* // <div className="chat-box" id="chat-box">
        //     <InfiniteScroll
        //         dataLength={messages.length}
        //         next={() => handleLoadMore(messages[0].id)}
        //         ref={chatRef}
        //         className="chat-box-scroll"
        //         scrollableTarget="chat-box"
        //         hasMore={true}
        //         inverse={true}
        //     > */}
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
        {/* //     </InfiniteScroll> */}
        {/* // </div> */}
        </div>
    )
}

export default ChatBox