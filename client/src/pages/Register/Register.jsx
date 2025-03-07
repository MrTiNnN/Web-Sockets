import { useContext, useEffect, useState } from "react"
import { DataContext } from "../../context/DataContext"
import AccountForm from "../../components/AccountForm/AccountForm"
import hero from '../../img/hero.png'

const Register = () => {
    // Gets global data from the context
    const { access, crud, navigate } = useContext(DataContext)



    // Redirects user if they are already logged in
    useEffect(() => {
        if(access) navigate('/dashboard/friends')
    }, [access])



    // Holds the state for the form
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)



    // Sends a register request to the backend
    const handleSubmit = async (e) => {
        e.preventDefault()

        const response = await crud({
            url: '/api/user/register/',
            method: 'post',
            body: {
                email,
                username,
                password
            }
        })

        console.log(response)

        if(response.status == 201) {
            navigate('/login')
        }
        else {
            setError(response.response.data.error)
        }
    }



    return (
        <section className="section-account">
            <img src={hero} className="hero-image" alt="Hero" />
            <AccountForm 
                title="Register"
                text="Make an account to start chatting now!"
                handleSubmit={handleSubmit}
                error={error}
                inputs={[
                    {
                        type: "email",
                        label: "Email",
                        value: email,
                        setValue: setEmail
                    },
                    {
                        type: "text",
                        label: "Username",
                        value: username,
                        setValue: setUsername
                    },
                    {
                        type: "password",
                        label: "Password",
                        value: password,
                        setValue: setPassword
                    }
                ]}
                button="Register"
                messages={[
                    "But I already have an account...",
                    "Log in now!"
                ]}
                link="/login"
            />
        </section>
    )
}

export default Register