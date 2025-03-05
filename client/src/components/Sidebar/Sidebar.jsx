import { FaUserFriends } from "react-icons/fa"
import '../../globalStyling/components.less'
import { NavLink } from "react-router-dom"

const Sidebar = ({ chats = [] }) => {
    console.log(chats)

    return (
        <div className="sidebar">
            <h2 className="title">Username</h2>

            <div className="friends-button-container">
                <NavLink to='/dashboard/friends' className={({ isActive }) => `friends-button ${isActive ? 'active' : null}`}>
                    <FaUserFriends className="icon" />
                    <p>Your friends</p>
                </NavLink>
            </div>

            <div className="chats-container">
                <h3 className="title">Your chats</h3>

                <div className="chats">
                    {
                        chats.map((chat, i) => (
                            <div className="chat-button" key={i}>
                                <img src="./img/user.png" alt="Pfp" />
                                <p>{chat.username}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Sidebar