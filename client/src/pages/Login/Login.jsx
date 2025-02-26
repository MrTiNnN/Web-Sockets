const Login = () => {
    // Gets global data from the context
        const { crud } = useContext(DataContext)
    
    
    
        // Holds the state for the form
        const [username, setUsername] = useState('')
        const [password, setPassword] = useState('')
    
    
    
        // Sends a login request to the backend
        const handleSubmit = async (e) => {
            e.preventDefault()
    
            const response = await crud({
                url: '/api/login',
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
                    <button type="submit">Login</button>
                </form>
            </>
        )
}

export default Login