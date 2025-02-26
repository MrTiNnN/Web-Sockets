import { useContext, useState } from "react"
import { DataContext } from "../../context/DataContext"

const Login = () => {
    // Gets global data from the context
        const { crud, setAccess, setRefresh } = useContext(DataContext)
    
    
    
        // Holds the state for the form
        const [email, setEmail] = useState('')
        const [password, setPassword] = useState('')
    
    
    
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                        type="password"
                    />
                    <button type="submit">Login</button>
                </form>
            </>
        )
}

export default Login