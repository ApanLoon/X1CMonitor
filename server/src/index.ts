import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import { Api, ApiEvent } from "./Api/Api.js";
import { X1Client, X1ClientEvent } from "./X1Client/X1Client.js";

dotenv.config();

// Create services:
//

const app: Express = express();
const api = new Api ({ Port: Number(process.env.API_Port || 4000 ) });
const x1Client = new X1Client(
{
  Host:     process.env.X1C_Host     || "",
  Serial:   process.env.X1C_Serial   || "",
  Password: process.env.X1C_Password || ""
});


// Set up event routing:
//
x1Client.on(X1ClientEvent.Print, print => api.sendPrint(print));

api.on(ApiEvent.SetLight,         (isOn)  => console.log(isOn));


// Start services:
//

await x1Client.connect();

// Express web server:
//
const port = process.env.WEB_PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Blahonga!");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

