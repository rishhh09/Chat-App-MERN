import { useEffect, useRef, useState } from 'react'
import './App.css'
import { io } from 'socket.io-client'
import LoginPage from './components/Auth/LoginPage'
import RegisterPage from './components/Auth/RegisterPage'
import Chat_frontend from './components/Chat_App_frontend/Chat_frontend'
import API from './api.js'

const SOCKET_URL = '/';

function App() {
  const [isLoginPage, setIsLoginPage] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLogoutSuccess, setIsLogoutSuccess] = useState(true)
  const [currentUserId, setCurrentUserId] = useState("")
  const [otherUserId, setOtherUserId] = useState("")

  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { autoConnect: false, withCredentials: true })
    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    const checkUserAuthentication = async () => {
      try {
        console.log('App: running checkAuth');
        const response = await API.get('api/user/checkAuth')
        if (response.status === 200) {
          const userId = response.data.userId
          console.log('App: checkAuth userId', userId)
          setIsLoggedIn(true)
          setCurrentUserId(userId)

          if (socketRef.current) {
            socketRef.current.auth = { userId }
            socketRef.current.connect()

            socketRef.current.once('connect', () => {
              console.log('socket connected after checkAuth, id:', socketRef.current.id)
              socketRef.current.emit('join', userId)
            })
          }
        }
      } catch (err) {
        console.log("User not Authenticated, Showing login page")
      }
    }
    checkUserAuthentication()
  }, [])

  const handleLoginSuccess = async (userId) => {
    console.log('App: handleLoginSuccess userId', userId);

    // if LoginPage didn't provide userId, fetch it from checkAuth
    let resolvedUserId = userId;
    if (!resolvedUserId) {
      try {
        const resp = await API.get('api/user/checkAuth');
        if (resp.status === 200) {
          resolvedUserId = resp.data?.userId ?? resp.data?._id ?? resp.data?.user?._id;
          console.log('App: recovered userId from checkAuth', resolvedUserId);
        }
      } catch (err) {
        console.error('App: unable to recover userId after login', err);
      }
    }

    if (!resolvedUserId) {
      console.warn('App: no userId available after login — aborting socket join');
      setIsLoggedIn(true); // still show UI if desired
      return;
    }

    setIsLoggedIn(true);
    setIsLogoutSuccess(false);
    setCurrentUserId(resolvedUserId);

    if (socketRef.current) {
      // ensure fresh handshake so server-side sees current cookie/auth
      try {
        if (socketRef.current.connected) socketRef.current.disconnect();
      } catch (e) { }

      socketRef.current.auth = { userId: resolvedUserId };
      socketRef.current.connect();
      socketRef.current.once('connect', () => {
        console.log('socket connected after login, id:', socketRef.current.id);
        socketRef.current.emit('join', resolvedUserId);
      });
    }
  }

  const handleLogout = async () => {
    try {
      await API.post('api/user/logout')
      setIsLoggedIn(false)
      setCurrentUserId("")
      setIsLogoutSuccess(true)
      setIsLoginPage(true)
      socketRef.current?.disconnect()
      socketRef.current = io(SOCKET_URL, { autoConnect: false, withCredentials: true })
      console.log('App: socket recreated on logout')
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
              (<LoginPage onSwitchToRegister={() => setIsLoginPage(false)} onLoginSuccess={handleLoginSuccess} />)
              : (<RegisterPage onSwitchToLogin={() => setIsLoginPage(true)} />)
          ) : (
            <div>
              <Chat_frontend socket={socketRef.current} currentUserId={currentUserId} otherUserId={otherUserId} onLogout={handleLogout} />
              <button className='bg-green-600 cursor-pointer text-white rounded-2xl' onClick={handleLogout}>Log Out</button>
            </div>
          )}
      </div>
    </>
  )
}

export default App

