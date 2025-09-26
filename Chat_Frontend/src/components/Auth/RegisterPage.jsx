import {useState} from 'react'
import axios from 'axios'

axios.defaults.withCredentials = true
const BASE_URL = `${import.meta.env.VITE_API_URL}/api/user`

const RegisterPage = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleRegister = async (e) => {

    e.preventDefault()
    setMessage("")
    setIsSuccess(false)

    if(password !== confirmPassword){
      setMessage("Passwords doesn't match")
      return
    }
    try{
      const response = await axios.post(`${BASE_URL}/register`, {email, username, password})
      setIsSuccess(true)
      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        onSwitchToLogin()
      }, 4000);

    }catch(error){
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setMessage(errorMessage);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-[#1a1a1a] text-gray-100 font-sans p-5">
      <div className="bg-[#2c2c2c] rounded-xl shadow-xl p-10 max-w-sm w-full text-center border border-[#8a2be2]/30">
        <h2 className="text-[#8a2be2] text-3xl font-bold mb-8">Register</h2>

        {message && (
          <div className={`p-4 rounded-md mb-4 text-center font-bold ${isSuccess ? 'bg-green-600 text-white': 'bg-red-600 text-white'}`} >
            {message}
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <div className="mb-5 text-left">
            <label className="block text-gray-400 font-semibold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full p-3 rounded-md border border-[#444] bg-[#333] text-white focus:outline-none focus:border-[#8a2be2] transition-colors"
              type="email"
              id="email"
              name="email"
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div className="mb-5 text-left">
            <label className="block text-gray-400 font-semibold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="w-full p-3 rounded-md border border-[#444] bg-[#333] text-white focus:outline-none focus:border-[#8a2be2] transition-colors"
              type="text"
              id="username"
              name="username"
              onChange={(e) => setUsername(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-5 text-left">
            <label className="block text-gray-400 font-semibold mb-2" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              className="w-full p-3 rounded-md border border-[#444] bg-[#333] text-white focus:outline-none focus:border-[#8a2be2] transition-colors"
              type="password"
              id="confirm-password"
              name="confirm-password"
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required
            />
          </div>
          <button
            className="w-full p-4 rounded-md bg-[#8a2be2] text-white font-bold text-lg mt-4 transition-transform transform hover:scale-105" type="submit" >
            Register
          </button>
        </form>
        <div className="mt-7 text-sm">
          <p>
            Already have an account?{' '}
            <span
              onClick={onSwitchToLogin}
              className="text-[#8a2be2] font-bold cursor-pointer hover:text-[#c39ded]"
            >
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;