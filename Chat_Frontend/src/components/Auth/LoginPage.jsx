import { useState } from 'react';
import API from '../../api';

const LoginPage = ({ onSwitchToRegister, onLoginSuccess, onLogoutSuccess }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsSuccess(false)
    setMessage("")

    try {
      // ensure cookie is set by using withCredentials
      const res = await API.post('/api/user/login', { email, password }, { withCredentials: true });

      // debug: log full response to verify server returns user id
      console.log('Login response:', res);

      // server may return userId or user object
      const userId = res.data?.userId ?? res.data?._id ?? res.data?.user?._id;

      // call parent callback so App knows user is logged in
      onLoginSuccess(userId)

      setMessage("Login Successful. Redirecting to HOME")
      setIsSuccess(true)
      onLogoutSuccess()
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed. Please try again."
      setMessage(errorMessage)
      setIsSuccess(false)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-[#1a1a1a] text-gray-100 font-sans p-5">
      <div className="bg-[#2c2c2c] rounded-xl shadow-xl p-10 max-w-sm w-full text-center border border-[#8a2be2]/30">
        <h2 className="text-[rgb(138,43,226)] text-3xl font-bold mb-8">Login</h2>
        {message &&
          <div className={`p-4 rounded-md mb-4 text-center font-bold ${isSuccess ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{message}</div>
        }
        <form onSubmit={handleLogin}>
          <div className="mb-5 text-left">
            <label className="block text-gray-400 font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full p-3 rounded-md border border-[#444] bg-[#333] text-white focus:outline-none focus:border-[#8a2be2] transition-colors"
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-5 text-left">
            <label className="block text-gray-400 font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full p-3 rounded-md border border-[#444] bg-[#333] text-white focus:outline-none focus:border-[#8a2be2] transition-colors"
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="w-full p-4 rounded-md bg-[#8a2be2] text-white font-bold text-lg mt-4 transition-transform transform hover:scale-105"
            type="submit"
          >
            Login
          </button>
        </form>
        <div className="mt-7 text-sm">
          <p>
            Don't have an account?{' '}
            <span
              onClick={onSwitchToRegister}
              className="text-[#8a2be2] font-bold cursor-pointer hover:text-[#c39ded]"
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;