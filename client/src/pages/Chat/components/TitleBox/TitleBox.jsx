import { useParams } from "react-router-dom"
import user from "../../../../img/user.png"

const TitleBox = () => {
    // Holds the chat
    const { username } = useParams()



    return (
        <div className="title-box">
            <img src={user} alt="Pfp" />
            <h4 className="title">{username}</h4>
        </div>
    )
}

export default TitleBox