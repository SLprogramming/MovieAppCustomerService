import express from "express"
import dotEnv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import {ErrorMiddleware} from "./middleware/error.js"
import conversationRouter from "./router/conversation.js"
import messageRouter from "./router/message.js"

dotEnv.config()



export const app = express()
//body parser
app.use(express.json({limit:"50mb"}))

//cookie parser
app.use(cookieParser())

const allowedOrigins = [
  "https://movie-app-website-mu.vercel.app",
  "http://192.168.110.124:5173",
  "http://192.168.110.124:5174"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // ✅ allow this origin
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // allow cookies
}));




app.use("/api/conversations",conversationRouter)
app.use("/api/messages",messageRouter)


app.all("*",(req,res,next) => {
    const err = new Error(`Route ${req.originalUrl} is not Found! `)
    err.statusCode = 404
    next(err)
})

app.use(ErrorMiddleware)