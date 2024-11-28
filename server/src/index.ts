import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Api, ApiEvent } from "./Api/Api.js";
import { X1Client, X1ClientEvent } from "./X1Client/X1Client.js";
import { Logger, LoggerEvent } from "./Logger/Logger.js";

dotenv.config();

// Create services:
//

const logger = new Logger({ fileName : process.env.LOG_FILE || "./logs/log.txt" });

logger.Log(
`____  ________________                         
\\   \\/  /_   \\_   ___ \\                        
 \\     / |   /    \\  \\/                        
 /     \\ |   \\     \\____                       
/___/\\  \\|___|\\______  /                       
      \\_/            \\/                        
   _____                .__  __                
  /     \\   ____   ____ |__|/  |_  ___________ 
 /  \\ /  \\ /  _ \\ /    \\|  \\   __\\/  _ \\_  __ \\
/    Y    (  <_> )   |  \\  ||  | (  <_> )  | \\/
\\____|__  /\\____/|___|  /__||__|  \\____/|__|   
        \\/            \\/                       \n`, true);
logger.Log("Starting up...");

const app: Express = express();
const api = new Api ({ Logger : logger, Port: Number(process.env.API_PORT) || 4000 });
const x1Client = new X1Client(
{
  Logger:   logger,
  Host:     process.env.X1C_HOST     || "",
  Serial:   process.env.X1C_SERIAL   || "",
  Password: process.env.X1C_PASSWORD || ""
});


// Set up event routing:
//
x1Client.on(X1ClientEvent.ConnectionStatus, isConnected => api.sendPrinterConnectionStatus(isConnected));
x1Client.on(X1ClientEvent.Status,           status      => api.sendStatus(status));
x1Client.on(X1ClientEvent.PropertyChanged,  change      => logger.LogChange(change));
x1Client.on(X1ClientEvent.LedCtrl,          ledCtrl     => console.log(ledCtrl));
x1Client.on(X1ClientEvent.LogLevelChanged,  level       => api.sendPrinterLogLevel(level));

api.on(ApiEvent.GetState,           sendState);
api.on(ApiEvent.SetLight,           isOn  => console.log(isOn));
api.on(ApiEvent.GetPrinterLogLevel, ()    => api.sendPrinterLogLevel(x1Client.LogLevel));
api.on(ApiEvent.SetPrinterLogLevel, level => x1Client.SetLogLevel(level));
api.on(ApiEvent.RequestFullLog,     ()    => logger.SendFullLog());

logger.on(LoggerEvent.MessageLogged, message => api.sendLogMessage(message));

// Start services:
//

x1Client.connect();

// Express web server:
//
const port = process.env.WEB_PORT || 3000;

const __filename = fileURLToPath(import.meta.url); // NOTE: This is the path to the folder where index.js is. I.e. dist/server/src and not dist as I was hoping.
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, './wwwroot'))); // NOTE: This is only correct when running from dist. When doing npm run dev, the static files will not be hosted correctly.

app.listen(port, () => {
  logger.Log(`[Web] Server is running at http://localhost:${port}`);
});

function sendState()
{
  api.sendPrinterConnectionStatus(x1Client.IsConnected);
  api.sendStatus(x1Client.status);
  api.sendPrinterLogLevel(x1Client.LogLevel);
}