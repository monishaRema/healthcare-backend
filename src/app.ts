import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { router } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";

const app: Application = express();



app.use(express.urlencoded({ extended: true }));


app.use(express.json());
app.use(cookieParser());

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

app.use("/api/v1",router)



app.use(globalErrorHandler)
app.use(notFound)




export default app;
