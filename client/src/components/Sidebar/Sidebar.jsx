import { FaUserFriends } from "react-icons/fa"
import '../../globalStyling/components.less'
import { NavLink } from "react-router-dom"
import { useContext } from "react"
import { DataContext } from "../../context/DataContext"
import user from "../../img/user.png"

const Sidebar = () => {
    // Gets global data from the context
    const { friends } = useContext(DataContext)

    

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
                        friends.map((chat, i) => (
                            <NavLink to={`/dashboard/chat/${chat.username}`} className={({ isActive }) => `chat-button ${isActive ? "active" : null}`} key={i}>
                                <img src={user} alt="Pfp" />
                                <p>{chat.username}</p>
                            </NavLink>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Sidebar