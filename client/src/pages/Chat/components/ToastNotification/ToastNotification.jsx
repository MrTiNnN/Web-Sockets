const ToastNotification = ({ username = "", message = "" }) => {
    return (
        <div className="toast-notification">
            <audio autoPlay>
                <source src="./audio/wolf.m4a" />
            </audio>
            <p className="toast-username">{username}</p>
            <p className="toast-message">{message}</p>
        </div>
    )
}

export default ToastNotification