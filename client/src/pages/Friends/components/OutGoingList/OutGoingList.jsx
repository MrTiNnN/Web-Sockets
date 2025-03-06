import { useContext } from "react"
import user from "../../../../img/user.png"
import { DataContext } from "../../../../context/DataContext"

const OutGoingList = () => {
    const { outGoing } = useContext(DataContext)

    return (
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
    )
}

export default OutGoingList