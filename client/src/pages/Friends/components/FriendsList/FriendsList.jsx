import { Link } from "react-router-dom"
import user from "../../../../img/user.png"
import { IoChatbubbleSharp } from "react-icons/io5";

const FriendsList = ({ friends }) => {
    return (
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
    )
}

export default FriendsList