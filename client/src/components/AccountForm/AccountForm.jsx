
import user from '../../img/user.png'
import Message from "../../components/Message/Message"
import { Link } from "react-router-dom"

const AccountForm = ({ title, text, handleSubmit, error, inputs = [], button, messages, link }) => {
    return (
        <div className="account-form-container">
            <div className="title-textbox">
                <img src={user} alt="Pfp" />
                <h2 className="title">{title}</h2>
                <p className="text">{text}</p>

                {
                    error &&
                    <p className="error">{error}</p>
                }
            </div>

            <form className="form" onSubmit={(e) => handleSubmit(e)}>

                {
                    inputs.length &&
                    inputs.map((input, i) => (
                        <div key={i} className="input-container">
                            <label htmlFor={input.label}>{input.label}</label>
                            <input
                                value={input.value}
                                onChange={(e) => input.setValue(e.target.value)}
                                type={input.type}
                                id={input.label}
                            />
                        </div>
                    ))
                }

                <button className="btn" type="submit">{button}</button>
            </form>

            <div className="link-message-container">
                <Message
                    type="in"
                    message={messages[0]}
                />
                <Link to={link} className="link-message">
                    <Message
                        type="out"
                        message={messages[1]}
                    />
                </Link>
            </div>
        </div>
    )
}

export default AccountForm