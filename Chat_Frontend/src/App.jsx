import { useEffect, useState } from 'react'
import './App.css'
import { io } from 'socket.io-client'
import LoginPage from './components/Auth/LoginPage'
import RegisterPage from './components/Auth/RegisterPage'
import Chat_frontend from './components/Chat_App_frontend/Chat_frontend'
import axios from 'axios'

const BASE_URL = 'http://localhost:5001/api/user'
const socket = io("http://localhost:5001")

function App() {

  const [isLoginPage, setIsLoginPage] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLogoutSuccess, setIsLogoutSuccess] = useState(true)
  const [currentUserId, setCurrentUserId] = useState("")
  const [otherUserId, setOtherUserId] = useState("")

  useEffect(() => {
    const checkUserAuthentication = async() => {
      try {
        const response = await axios.get(`${BASE_URL}/checkAuth`)
        if (response.status === 200) {
          setIsLoggedIn(true)
          setCurrentUserId(response.data.userId)
        }
      }catch(err){
        console.log("User not Authenticated, Showing login page")
      }
    }
    checkUserAuthentication()
  }, [])

const handleSwitchToLogin = () => {
  setIsLoginPage(true)
}
const handleSwitchToRegister = () => {
  setIsLoginPage(false)
}
const handleLoginSuccess = (userId) => {
  setIsLoggedIn(true)
  setIsLogoutSuccess(false)
  setCurrentUserId(userId)
}

const handleLogout = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/logout`)
    setIsLoggedIn(false)
    setCurrentUserId("")
    setIsLogoutSuccess(true)
    setIsLoginPage(true)
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Logout Failed, can't logout user"
    console.error(errorMessage)
  }
}

return (
  <>
    <div>
      {
        !isLoggedIn ? (
          isLoginPage ?
            (<LoginPage onSwitchToRegister={handleSwitchToRegister} onLoginSuccess={handleLoginSuccess} />)
            : (<RegisterPage onSwitchToLogin={handleSwitchToLogin} />)
        ) : (
          <div>
            <Chat_frontend socket={socket} currentUserId={currentUserId} otherUserId={otherUserId} onLogout={handleLogout}/>
            <button className='bg-green-600 cursor-pointer text-white rounded-2xl' onClick={handleLogout}>Log Out</button>
          </div>
        )}
    </div>
  </>
)
}

export default App

