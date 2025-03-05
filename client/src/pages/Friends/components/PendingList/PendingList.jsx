import user from "../../../../img/user.png"
import { IoCheckmark, IoClose } from "react-icons/io5";

const PendingList = ({ socket, pending, setPending, friends, setFriends }) => {
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
    )
}

export default PendingList