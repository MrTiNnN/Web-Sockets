import { useContext, useState } from "react"
import { DataContext } from "../../context/DataContext"

const Register = () => {
    // Gets global data from the context
    const { crud, navigate } = useContext(DataContext)



    // Holds the state for the form
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')



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
    }



    return (
        <>
            <form onSubmit={(e) => handleSubmit(e)}>
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email"
                    type="email"
                />
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                />
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    type="password"
                />
                <button type="submit">Register</button>
            </form>
        </>
    )
}

export default Register