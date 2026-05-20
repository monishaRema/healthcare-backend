import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { AdminRoutes } from "./app/modules/admin/admin.routes";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";

const app: Application = express();
app.set("view engine", "ejs");
app.set("views",path.resolve(process.cwd(), `src/app/templates`) )

// app.use(cors({
//     origin : [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
//     credentials : true,
//     methods : ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     allowedHeaders : ["Content-Type", "Authorization"]
// }))
app.use("/api/auth", toNodeHandler(auth))



app.use(express.urlencoded({ extended: true }));


app.use(express.json());
app.use(cookieParser());

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

app.use("/api/v1",router)
app.use("/api/v1/admin", AdminRoutes)



app.use(globalErrorHandler)
app.use(notFound)




export default app;
