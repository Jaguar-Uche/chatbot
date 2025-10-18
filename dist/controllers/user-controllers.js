import User from "../models/User.js";
import { hash, compare } from 'bcrypt';
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";
export const getAllUsers = async (req, res, next) => {
    //get all users from the database
    try {
        const users = await User.find();
        return res.status(200).json({ message: "Ok", users });
    }
    catch (error) {
        console.log(error);
        return res.status(404).json({ message: "ERROR", cause: error.message });
    }
};
export const userSignUp = async (req, res, next) => {
    //user sign up
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(401).send("User already registered please sign up with another email or change your email through the settings");
        const hashedPassword = await hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        //create token and store cooke 
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            domain: 'localhost',
            //the domain assigned to me
            signed: true,
            path: '/',
        });
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        const token = createToken(user._id.toString(), user.email, '7d');
        res.cookie(COOKIE_NAME, token, {
            path: '/',
            domain: 'localhost',
            //domain name
            expires,
            httpOnly: true,
            signed: true,
        });
        return res.status(201).json({ message: "Ok", name: user.name, email: user.email });
    }
    catch (error) {
        console.log(error);
        return res.status(404).json({ message: "ERROR", cause: error.message });
    }
};
export const userLogin = async (req, res, next) => {
    //user login
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).send("User not Found, Please register the user or use a registered user");
        const isPasswordCorrect = await compare(password, user.password);
        if (!isPasswordCorrect)
            return res.status(403).send("Incorrect Password");
        //Create a token for a logged In user(more like an id card)
        //the user would need to use this token to access somethings along the line
        //JSON WEB TOKEN is used to encrypt a payload into a signed token that has the permissions or authorities of the user
        //use cookie parser to send the cookie from the backend to the frontend
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            domain: 'localhost',
            //this should be my domain
            signed: true,
            path: '/',
        });
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);
        const token = createToken(user._id.toString(), user.email, '7d');
        res.cookie(COOKIE_NAME, token, {
            path: '/',
            domain: 'localhost',
            //the domain assigned to me
            expires,
            httpOnly: true,
            signed: true,
        });
        return res.status(200).json({ message: "Ok", name: user.name, email: user.email });
    }
    catch (error) {
        console.log(error);
        return res.status(404).json({ message: "ERROR", cause: error.message });
    }
};
export const verifyUser = async (req, res, next) => {
    try {
        //user Token Check
        const user = await User.findById(res.locals.jwtData.id);
        if (!user)
            return res.status(401).send("User not registered or Token Malfunction");
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions dont match");
        }
        return res.status(200).json({ message: "Ok", name: user.name, email: user.email });
    }
    catch (error) {
        console.log(error);
        return res.status(404).json({ message: "ERROR", cause: error.message });
    }
};
export const userLogout = async (req, res, next) => {
    try {
        //user Token Check
        const user = await User.findById(res.locals.jwtData.id);
        if (!user)
            return res.status(401).send("User not registered or Token Malfunction");
        if (user._id.toString() !== res.locals.jwtData.id) {
            return res.status(401).send("Permissions dont match");
        }
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            domain: 'localhost',
            //domain assigned to me
            signed: true,
            path: '/',
        });
        return res.status(200).json({ message: "Ok", name: user.name, email: user.email });
    }
    catch (error) {
        console.log(error);
        return res.status(404).json({ message: "ERROR", cause: error.message });
    }
};
//# sourceMappingURL=user-controllers.js.map