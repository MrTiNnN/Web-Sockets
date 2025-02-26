import { useContext, useState } from "react"
import { DataContext } from "../../context/DataContext"

const Register = () => {
    // Gets global data from the context
    const { crud } = useContext(DataContext)



    // Holds the state for the form
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')



    // Sends a register request to the backend
    const handleSubmit = async (e) => {
        e.preventDefault()

        const response = await crud({
            url: '/api/register',
            body: {
                username,
                password
            }
        })

        console.log(response)
    }



    return (
        <>
            <form onSubmit={(e) => handleSubmit(e)}>
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