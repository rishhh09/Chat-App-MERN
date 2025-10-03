import axios from "axios";

const API = axios.create({
    base_url: '/'
})

API.defaults.withCredentials = true

export default API