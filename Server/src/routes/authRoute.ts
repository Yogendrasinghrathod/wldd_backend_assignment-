import {Router} from 'express'
import { login, signup } from '../controllers/authController';
import authMiddleware from '../middlewares/authMiddleware';


const router=Router()

router.post('/signup',signup)
router.post('/login',login)


export default router ;