import { useContext, useEffect, useRef, useState } from "react"
import { DataContext } from "../../context/DataContext"
import Sidebar from "../../components/Sidebar/Sidebar"
import '../../globalStyling/components.less'
import './friends.less'
import user from "../../img/user.png"
import { IoCheckmark, IoClose, IoChatbubbleSharp } from "react-icons/io5";
import { Link } from "react-router";

const Friends = () => {
    // Holds the username input for the friend request
    const [username, setUsername] = useState("")

    // Holds the pending requests
    const [pending, setPending] = useState([])

    // Holds the outgoing requests
    const [outGoing, setOutGoing] = useState([])

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

            // Gets the user's received requests
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
                    if(data.user_friends && data.user_friends.length) {
                        const friendArr = data.user_friends.map(friend => {
                            return {
                                id: friend.id,
                                username: friend.sender__username ? friend.sender__username : friend.recipient__username
                            }
                        })

                        if(friendArr && friendArr.length) setFriends(friendArr)
                    }


                }

                // Gets received requests
                if(data.action === "get_friend_requests") {
                    if(data.friend_requests && data.friend_requests.length) {
                        let requestArr = data.friend_requests.filter(request => request.status === "pending")
                        requestArr = requestArr.map(request => {
                            return { sender: request.sender__username }
                        })
                        // console.log(requestArr)
                        setPending([...pending, ...requestArr])
                    }
                }

                // Gets outgoing requests
                if(data.action === "get_friend_requests_send_from_you") {
                    if(data.get_friend_requests_send_from_you && data.get_friend_requests_send_from_you.length) {
                        let requestArr = data.get_friend_requests_send_from_you.filter(request => request.status === "pending")
                        requestArr = requestArr.map(request => {
                            return { recipient: request.recipient__username }
                        })
                        setOutGoing([...outGoing, ...requestArr])
                    }
                }

            }

            // Receives a friend request
            if(data.action === "friend_request") {
                const request = { sender: data.sender }
                setPending((prev) => [request, ...prev])
            }

            // Handles an accepted request
            if(data.action === "friend_request_accepted") {
                const newOutGoing = outGoing.filter(request => request.recipient !== data.sender)
                setOutGoing([...newOutGoing])
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

        setOutGoing([{ recipient: username }, ...outGoing])
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

        const newFriends = [ { username: sender }, ...friends ]
        setFriends(newFriends)
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
        <section className="section-friends">
            <form className="add-friend-form" onSubmit={(e) => handleSubmit(e)}>
                <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button className="btn" type="submit">Add friend</button>
            </form>

            <div className="lists-container">

                {
                    pending && pending.length > 0 &&
                    <div className="list-container">
                        <p className="label"><strong>Received</strong></p>
                        <div className="list">
                            {
                                pending.map((request, i) => (
                                    <div className="friend" key={i}>
                                        <div className="friend-label">
                                            <img src={user} alt="Pfp" />
                                            <p>{request.sender}</p>
                                        </div>
                                        <div className="button-box">
                                            <IoCheckmark className="icon" onClick={() => handleAcceptFriend(request.sender)} />
                                            <IoClose className="icon secondary" onClick={() => handleRejectFriend(request.sender)} />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                }

                {
                    outGoing && outGoing.length > 0 &&
                    <div className="list-container">
                        <p className="label"><strong>Outgoing</strong></p>
                        <div className="list">
                            {
                                outGoing.map((request, i) => (
                                    <div className="friend" key={i}>
                                        <div className="friend-label">
                                            <img src={user} alt="Pfp" />
                                            <p>{request.recipient}</p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                }

                {
                    friends && friends.length > 0 &&
                    <div className="list-container">
                        <p className="label"><strong>Friends</strong></p>
                        <div className="list">
                            {
                                friends.map((friend, i) => (
                                    <div className="friend" key={i}>
                                        <div className="friend-label">
                                            <img src={user} alt="Pfp" />
                                            <p>{friend.username}</p>
                                        </div>

                                        <div className="button-box">
                                            <Link to={`/dashboard/chat/${friend.username}`}><IoChatbubbleSharp className="icon"/></Link>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                }

            </div>
        </section>
    )
}
 
export default Friends