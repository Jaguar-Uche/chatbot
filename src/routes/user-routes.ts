import { Router } from "express";
import { getAllUsers, userLogin, userLogout, userSignUp, verifyUser } from "../controllers/user-controllers.js";
import { loginValidator, signupValidator, validate } from "../utils/validators.js";
import { verifyToken } from "../utils/token-manager.js";

const userRoutes = Router();

userRoutes.get('/', getAllUsers);
userRoutes.post('/signup',validate(signupValidator),userSignUp);
userRoutes.post('/login',validate(loginValidator),userLogin);
//@ts-ignore
userRoutes.get("/auth-status",verifyToken ,verifyUser)
//@ts-ignore
userRoutes.get('/logout',verifyToken , userLogout)

export default userRoutes;