import { useContext, useEffect, useRef, useState } from "react"
import { DataContext } from "../../context/DataContext"
import '../../globalStyling/components.less'
import './friends.less'
import FriendForm from './components/FriendForm/FriendForm'
import PendingList from './components/PendingList/PendingList'
import OutGoingList from './components/OutGoingList/OutGoingList'
import FriendsList from './components/FriendsList/FriendsList'

const Friends = () => {
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



    return (
        <section className="section-friends">
            <FriendForm
                socket={socket}
                outGoing={outGoing}
                setOutGoing={setOutGoing}
            />

            <div className="lists-container">
                {
                    pending && pending.length > 0 &&
                    <PendingList
                        socket={socket}
                        pending={pending}
                        setPending={setPending}
                        friends={friends}
                        setFriends={setFriends}
                    />
                }
                {
                    outGoing && outGoing.length > 0 &&
                    <OutGoingList
                        outGoing={outGoing}
                    />
                }
                {
                    friends && friends.length > 0 &&
                    <FriendsList
                        friends={friends}
                    />
                }
            </div>
        </section>
    )
}
 
export default Friends