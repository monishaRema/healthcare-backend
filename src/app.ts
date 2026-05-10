import express, { Application, Request, Response } from "express";
import { router } from "./app/routes";

const app: Application = express();



app.use(express.urlencoded({ extended: true }));


app.use(express.json());

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript + Express!');
});

app.use("/api/v1",router)




export default app;
