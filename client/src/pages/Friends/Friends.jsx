import { useContext, useEffect, useRef, useState } from "react"
import { DataContext } from "../../context/DataContext"

const Friends = () => {
    // Holds the username input for the friend request
    const [username, setUsername] = useState("")

    // Holds the pending requests
    const [pending, setPending] = useState([])

    // Holds the user's friends
    const [friends, setFriends] = useState([])



    // Gets global data from the context
    const { access } = useContext(DataContext)


    // Stores the websocket connection
    const socket = useRef()

    // Connects the web socket server
    useEffect(() => {
        socket.current = new WebSocket(`ws://localhost:8000/ws/chat/?token=${access}`)
        // socket.current = new WebSocket(`ws://localhost:8000/ws/user/MikiPiki/?token=${access}`)


        // Logs the successful connection
        socket.current.onopen = () => {
            console.log("Connected to WebSocket");

            // Gets the user's friend list
            socket.current.send(JSON.stringify({
                action: "get_user_friends"
            }))

            // Gets the user's pending requests
            socket.current.send(JSON.stringify({
                action: "get_friend_requests"
            }))

            // Gets the user's pending requests
            socket.current.send(JSON.stringify({
                action: "get_friend_requests_send_from_you"
            }))
        };


        // Receives the messages from the web socket server
        socket.current.onmessage = (event) => {
            // const data = JSON.parse(event.data);
            const data = JSON.parse(event.data);
            console.log("📩 Message received:", data);

            if(data.type === "send_data") {

                // Gets friends list
                if(data.action === "get_user_friends") {
                    if(data.user_friends.length) {
                        const friendArr = data.user_friends.map(friend => {
                            return {
                                id: friend.id,
                                username: friend.sender__username ? friend.sender__username : friend.recipient__username
                            }
                        })

                        if(friendArr && friendArr.length) setFriends(friendArr)
                    }
                }
            }

            if(data.action === "friend_request") {
                setPending((prev) => [...prev, data])
            }
        };


        // Logs the closed connection
        socket.current.onclose = () => {
            console.log("WebSocket connection closed");
        };


        return () => {
            socket.current.close()
        }
    }, [access])



    // Sends a friend request
    const handleSubmit = (e) => {
        e.preventDefault()

        if(username.trim() === "") return

        const data = {
            action: "send_friend_request",
            recipient: username
        }

        socket.current.send(JSON.stringify(data))

        setUsername("")
    }



    // Accepts a friend request
    const handleAcceptFriend = (sender) => {
        socket.current.send(JSON.stringify({
            action: "accept_friend_request",
            sender
        }))

        const newPending = pending.filter(request => request.sender !== sender)
        setPending(newPending)
    }



    // Rejects a friend request
    const handleRejectFriend = (recipient) => {
        socket.current.send(JSON.stringify({
            action: "decline_friend_request",
            recipient
        }))

        const newPending = pending.filter(request => request.sender !== recipient)
        setPending(newPending)
    }



    return (
        <>
            <form onSubmit={(e) => handleSubmit(e)}>
                <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button type="submit">Add friend</button>
            </form>

            {
                pending.map((request, i) => (
                    <div key={i}>
                        <p>{request.sender}</p>
                        <button onClick={() => handleAcceptFriend(request.sender)}>Accept</button>
                        <button onClick={() => handleRejectFriend(request.sender)}>Reject</button>
                    </div>
                ))
            }

            <strong>Friends</strong>
            {
                friends.map((friend, i) => (
                    <div key={i}>
                        <p>{friend.username}</p>
                    </div>
                ))
            }
        </>
    )
}
 
export default Friends