import user from "../../../../img/user.png"

const OutGoingList = ({ outGoing }) => {
    return (
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