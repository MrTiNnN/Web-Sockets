import { useContext, useState } from "react"
import { DataContext } from "../../../../context/DataContext"

const FriendForm = () => {
    // Gets global data from the context
    const { socket, outGoing, setOutGoing } = useContext(DataContext)



    // Holds the username input for the friend request
    const [username, setUsername] = useState("")



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



    return (
        <form className="add-friend-form" onSubmit={(e) => handleSubmit(e)}>
            <input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <button className="btn" type="submit">Add friend</button>
        </form>
    )
}

export default FriendForm