import {Request, Response, NextFunction } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

export const createToken = (
  id: string,
  email: string,
  expiresIn: string | number
) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload = { id, email };

  const token = jwt.sign(payload, process.env.JWT_SECRET as Secret, {
    expiresIn,
  } as SignOptions);

  return token;
};

export const verifyToken = async (req:Request, res:Response, next:NextFunction)=>{
  const token = req.signedCookies[`${COOKIE_NAME}`];
  if(!token || token.trim() === "") {
    return res.status(401).json({message:"Token not received"})
  }
  return new Promise<void>((resolve,reject)=>{
    return jwt.verify(token, process.env.JWT_SECRET,(err,success)=>{
      if(err){
        reject(err.message);
        return res.status(401).json({message:"Token Expired"});
      }
      else{
        resolve();
        res.locals.jwtData = success;
        return next();
      }
    })
  })
}