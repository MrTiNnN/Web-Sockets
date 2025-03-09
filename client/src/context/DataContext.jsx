import axios from "axios";
import { createContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export const DataContext = createContext({ })

const DataProvider = ({ children }) => {
    // Sends the user to a different page
    const navigate = useNavigate()



    // Gets the JWT tokens if the user has logged in
    const [refresh, setRefresh] = useState(localStorage.getItem('refresh') || null)
    const [access, setAccess] = useState(localStorage.getItem('access') || null)



    // Sets the url for the backend server
    axios.defaults.baseURL = 'http://127.0.0.1:8000/'



    // Makes a CRUD operation to the backend server
    const crud = async ({ url, method, body = null, headers = null }) => {
        try {
            const config = {
                headers: access ? {
                    'Authorization': `Bearer ${access}`,
                    ...headers
                } : {
                    headers
                }
            }

            let response;
            if (method.toLowerCase() === 'get' || method.toLowerCase() === 'delete') {
                response = await axios[method](url, config);
            } else {
                response = await axios[method](url, body, config);
            }

            if(response) return response
        } catch(err) {
            return err
        }
    }



    // Holds whether the layout grid is shown or not
    const [grid, setGrid] = useState(false)



    // Holds the pending requests
    const [pending, setPending] = useState([])

    // Holds the outgoing requests
    const [outGoing, setOutGoing] = useState([])

    // Holds the user's friends
    const [friends, setFriends] = useState([])



    // Stores the websocket connection
    const socket = useRef()


    // Establishes a websocket connection when a user logs in
    useEffect(() => {
        if(access) {
            socket.current = new WebSocket(`ws://localhost:8000/ws/chat/?token=${access}`)


            // Logs the successful connection
            socket.current.onopen = () => {
                console.log("Connected to WebSocket");

                // Gets the user's friend list
                socket.current.send(JSON.stringify({action: "get_user_friends"}))

                // Gets the user's received requests
                socket.current.send(JSON.stringify({action: "get_friend_requests"}))

                // Gets the user's pending requests
                socket.current.send(JSON.stringify({action: "get_friend_requests_send_from_you"}))
            };


            // Receives the messages from the web socket server
            socket.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log("📩 Message received:", data);

                if(data.type === "send_data") {
                    
                    // Gets friends list
                    if(data.action === "get_user_friends") {
                        if(data.user_friends && data.user_friends.length) {
                            const friendArr = data.user_friends.map(friend => {
                                return {
                                    username: friend.sender__username ? friend.sender__username : friend.recipient__username
                                }
                            })

                            if(friendArr && friendArr.length) setFriends(friendArr)
                        }


                    }

                    // Gets received requests
                    if(data.action === "get_friend_requests") {
                        if(data.friend_requests && data.friend_requests.length) {
                            let requestArr = data.friend_requests.filter(request => request.status === "pending")
                            requestArr = requestArr.map(request => {
                                return { sender: request.sender__username }
                            })
                            // console.log(requestArr)
                            setPending([...pending, ...requestArr])
                        }
                    }

                    // Gets outgoing requests
                    if(data.action === "get_friend_requests_send_from_you") {
                        if(data.get_friend_requests_send_from_you && data.get_friend_requests_send_from_you.length) {
                            let requestArr = data.get_friend_requests_send_from_you.filter(request => request.status === "pending")
                            requestArr = requestArr.map(request => {
                                return { recipient: request.recipient__username }
                            })
                            setOutGoing([...outGoing, ...requestArr])
                        }
                    }

                }

                // Receives a friend request
                if(data.action === "friend_request") {
                    const request = { sender: data.sender }
                    setPending((prev) => [request, ...prev])
                }

                // Handles an accepted request
                if(data.action === "friend_request_accepted") {
                    const newOutGoing = outGoing.filter(request => request.recipient !== data.sender)
                    console.log(newOutGoing)
                    setOutGoing([...newOutGoing])

                    setFriends([{ username: data.sender }, ...friends])
                }
            };


            // Logs the closed connection
            socket.current.onclose = () => {
                console.log("WebSocket connection closed");
            };


            return () => {
                socket.current.close()
            }
        }
    }, [access])



    return (
        <DataContext.Provider value={{
            navigate,
            crud, access, setAccess, refresh, setRefresh,
            socket,
            friends, setFriends, pending, setPending, outGoing, setOutGoing,
            grid, setGrid
        }}>
            { children }
        </DataContext.Provider>
    )
}

export default DataProvider