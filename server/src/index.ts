import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Api, ApiEvent } from "./Api/Api.js";
import { X1Client, X1ClientEvent } from "./X1Client/X1Client.js";
import { type Change } from "./X1Client/CompareObjects.js"
import { JobEvent, JobManager } from "./JobManager/JobManager.js";
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
const jobManager = new JobManager();
const api = new Api ({ Logger : logger, Port: Number(process.env.API_PORT) || 4000 });
const x1Client = new X1Client(
{
  Logger:   logger,
  Host:     process.env.X1C_HOST     || "",
  Serial:   process.env.X1C_SERIAL   || "",
  Password: process.env.X1C_PASSWORD || "",
  FtpOptions: 
  {
    Port: 990,
    LocalFilePath: "./projectArchive"
  }
});


// Set up event routing:
//

jobManager.on(JobEvent.JobFailed,     job => logger.LogJobStopped(job));
jobManager.on(JobEvent.JobCompleted,  job => logger.LogJobStopped(job));
jobManager.on(JobEvent.JobGetProject, job => x1Client.LoadProject(job));
jobManager.on(JobEvent.JobUpdated,    job => api.sendCurrentJob (job));

x1Client.on(X1ClientEvent.ConnectionStatus, isConnected => api.sendPrinterConnectionStatus(isConnected));
x1Client.on(X1ClientEvent.Status,           status      => api.sendStatus(status));
x1Client.on(X1ClientEvent.Status,           status      => jobManager.HandleStatus(status));
x1Client.on(X1ClientEvent.PropertyChanged,  onPropertyChanged);
x1Client.on(X1ClientEvent.LedCtrl,          ledCtrl        => console.log(ledCtrl));
x1Client.on(X1ClientEvent.LogLevelChanged,  level          => api.sendPrinterLogLevel(level));
x1Client.on(X1ClientEvent.ProjectLoaded,    (project, job) => jobManager.HandleProjectLoaded(project, job));

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
let __dirname = path.dirname(__filename); // TODO: __dirname will be "dist/server/src" int prod and "D:\GIT\ApanLoon\X1CMonitor\server\src\" in dev.

let wwwroot = "./wwwroot";
let projectArchive = "./projectArchive";

if (process.env.IS_DEVELOPMENT)
{
  __dirname = path.join(__dirname, "..");
  wwwroot = path.join("dist", wwwroot);
}

app.use("/",               express.static(path.join(__dirname, wwwroot)));
app.use("/projectArchive", express.static(path.join(__dirname, projectArchive)));


app.listen(port, () => {
  logger.Log(`[Web] Server is running at http://localhost:${port}`);
});

function sendState()
{
  api.sendPrinterConnectionStatus(x1Client.IsConnected);
  api.sendStatus(x1Client.status);
  api.sendPrinterLogLevel(x1Client.LogLevel);
  api.sendCurrentJob(jobManager.CurrentJob);
}

function onPropertyChanged (change : Change)
{
  logger.LogChange(change);
  jobManager.HandleChange(change);
}
