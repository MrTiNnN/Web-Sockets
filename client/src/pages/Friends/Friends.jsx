import { useContext, useEffect, useRef, useState } from "react"
import { DataContext } from "../../context/DataContext"

const Friends = () => {
    // Holds the username input for the friend request
    const [username, setUsername] = useState("")

    // Holds the pending requests
    const [pending, setPending] = useState([])



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
        };


        // Receives the messages from the web socket server
        socket.current.onmessage = (event) => {
            // const data = JSON.parse(event.data);
            const data = JSON.parse(event.data);
            console.log("📩 Message received:", data);

            if(data.action === "friend_request") {
                setPending([...pending, data])
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
        console.log(newPending)
        setPending(newPending)
    }



    // Rejects a friend request
    const handleRejectFriend = () => {

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
                        <button onClick={handleRejectFriend}>Reject</button>
                    </div>
                ))
            }
        </>
    )
}
 
export default Friends