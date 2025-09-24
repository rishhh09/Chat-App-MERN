import express from 'express'
import { registerUser, loginUser, logoutUser, userInfo, getAllUsers} from "../controllers/authController.js";
import {validateToken} from "../middleware/validateToken.js"
const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', validateToken, logoutUser)
router.get('/userInfo', validateToken, userInfo )
router.get("/all", getAllUsers);
router.get('/checkAuth', validateToken, (req, res) => {
    res.status(200).json({
        message: "Authenticated",
        userId: req.user.id
    })
})

export default router