import { useContext, useEffect, useState } from "react"
import { DataContext } from "../../context/DataContext"
import hero from '../../img/hero.png'
import AccountForm from "../../components/AccountForm/AccountForm"

const Login = () => {
    // Gets global data from the context
    const { crud, access, setAccess, setRefresh, navigate } = useContext(DataContext)



    // Redirects user if they are already logged in
    useEffect(() => {
        if(access) navigate('/dashboard/friends')
    }, [access])
    
    
    
    // Holds the state for the form
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)



    // Sends a login request to the backend
    const handleSubmit = async (e) => {
        e.preventDefault()

        const response = await crud({
            url: '/api/user/login/',
            method: 'post',
            body: {
                email,
                password
            }
        })

        console.log(response)

        if(response.status == 200) {
            localStorage.setItem('access', response.data.token.access)
            setAccess(response.data.token.access)

            localStorage.setItem('refresh', response.data.token.refresh)
            setRefresh(response.data.token.refresh)

            navigate("/friends")
        }
        
        else {
            setError(response.response.data.error)
        }
    }



    return (
        <section className="section-account">
            <AccountForm
                title="Log in"
                text="Welcome back! Enter your credentials, please."
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
                        type: "password",
                        label: "Password",
                        value: password,
                        setValue: setPassword
                    }
                ]}
                button="Log in"
                messages={[
                    "I don't have an account...",
                    "Register now!"
                ]}
                link="/register"
            />

            <img src={hero} className="hero-image" alt="Hero" />
        </section>
    )
}

export default Login