import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import { ChatCompletionRequestMessage, OpenAIApi } from "openai";

export const generateChatCompletion = async (req:Request, res:Response, next:NextFunction)=>{
  const {message} = req.body;
  try {
    const user = await User.findById(res.locals.jwtData.id);

  if(!user) return res.status(401).json({message: "User not recognized or Token Malfunctioned"})//You should store these messages inside constant.ts so you can access them over and over again

  //grab chats of the user to get the context of the conversation and send them along with the new one
  const chats = user.chats.map(({role,content})=> ({role,content})) as ChatCompletionRequestMessage[];//get all existing chats
  chats.push({content:message, role:"user"});//add new chat to the existing chats
  user.chats.push({content:message, role:"user"});//add the chat to the user db

  const config= configureOpenAI();
  const openai = new OpenAIApi(config);
  const chatResponse = await openai.createChatCompletion({model:"gpt-3.5-turbo",
    messages:chats.slice(-10),
  })

  user.chats.push(chatResponse.data.choices[0].message);
  await  user.save();
  return res.status(200).json({chats: user.chats})
  //get latest response


  } catch (error) {
    console.log(error);
    return res.status(500).json({message: "something went wrong"})
  }
}

export const sendChats = async (req:Request,res:Response, next:NextFunction)=>{

  try {
    //user Token Check
    const user = await User.findById(res.locals.jwtData.id)
    if(!user) return res.status(401).send("User not registered or Token Malfunction");
    if(user._id.toString() !== res.locals.jwtData.id){
      return res.status(401).send("Permissions dont match");
    }

    return res.status(200).json({message: "Ok",chats:user.chats})
  } catch (error) {
    console.log(error);
    return res.status(404).json({message:"ERROR", cause: error.message})
  }
}

export const deleteChats = async (req:Request,res:Response, next:NextFunction)=>{

  try {
    //user Token Check
    const user = await User.findById(res.locals.jwtData.id)
    if(!user) return res.status(401).send("User not registered or Token Malfunction");
    if(user._id.toString() !== res.locals.jwtData.id){
      return res.status(401).send("Permissions dont match");
    }

    //@ts-ignore
    user.chats = [];
    await user.save()
    return res.status(200).json({message: "Ok"})
  } catch (error) {
    console.log(error);
    return res.status(404).json({message:"ERROR", cause: error.message})
  }
}