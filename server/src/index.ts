import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Api, ApiEvent } from "./Api/Api.js";
import { BambuClient, BambuClientEvent } from "./BambuClient/BambuClient.js";
import { type Change } from "./BambuClient/CompareObjects.js"
import { JobEvent, JobManager } from "./JobManager/JobManager.js";
import { Logger, LoggerEvent } from "./Logger/Logger.js";
import { Database } from "./Database/Database.js";

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

const database = new Database(
{
  Logger:   logger,
  Host:     process.env.DB_HOST         || "",
  Port:     Number(process.env.DB_PORT) || 27017,
  Database: process.env.DB_NAME         || "BambuMonitor",
  UserName: process.env.DB_USER         || "bambumonitor",
  Password: process.env.DB_PWD          || ""
});
  
const jobManager = new JobManager(
{
  Database: database
});

const api = new Api ({ Logger : logger, Port: Number(process.env.API_PORT) || 4000 });

const bambuClient = new BambuClient(
{
  Logger:   logger,
  Host:     process.env.X1C_HOST     || "",
  Serial:   process.env.X1C_SERIAL   || "",
  Password: process.env.X1C_PASSWORD || "",
  FtpOptions: 
  {
    Port: 990,
    LocalFilePath: "./projectArchive"
  },
});

//bambuClient.SetLogLevel(LogLevel.Trace);

// Set up event routing:
//

jobManager.on(JobEvent.JobFailed,     job => logger.LogJobStopped(job));
jobManager.on(JobEvent.JobCompleted,  job => logger.LogJobStopped(job));
jobManager.on(JobEvent.JobGetProject, job => bambuClient.LoadProject(job));
jobManager.on(JobEvent.JobUpdated,    job => database.UpdateJob (job));
jobManager.on(JobEvent.JobUpdated,    job => api.sendCurrentJob (job));

bambuClient.on(BambuClientEvent.ConnectionStatus, isConnected => api.sendPrinterConnectionStatus(isConnected));
bambuClient.on(BambuClientEvent.Status,           status      => api.sendStatus(status));
bambuClient.on(BambuClientEvent.Status,           status      => jobManager.HandleStatus(status));
bambuClient.on(BambuClientEvent.PropertyChanged,  onPropertyChanged);
bambuClient.on(BambuClientEvent.LedCtrl,          ledCtrl        => console.log(ledCtrl));
bambuClient.on(BambuClientEvent.LogLevelChanged,  level          => api.sendPrinterLogLevel(level));
bambuClient.on(BambuClientEvent.ProjectLoaded,    (project, job) => jobManager.HandleProjectLoaded(project, job));

api.on(ApiEvent.GetState,                 sendState);
api.on(ApiEvent.SetLight,                 isOn  => console.log(isOn));
api.on(ApiEvent.GetPrinterLogLevel,       ()    => api.sendPrinterLogLevel(bambuClient.LogLevel));
api.on(ApiEvent.SetPrinterLogLevel,       level => bambuClient.SetLogLevel(level));
api.on(ApiEvent.RequestFullLog,           ()    => logger.SendFullLog());
api.on(ApiEvent.RequestJobHistory,  async ()    => api.sendJobHistory(await jobManager.GetJobHistory()))

logger.on(LoggerEvent.MessageLogged, message => api.sendLogMessage(message));

// Start services:
//
await database.Connect();
bambuClient.connect();

// Express web server:
//
const webPort = Number(process.env.WEB_PORT) || 3000;

const __filename = fileURLToPath(import.meta.url); // NOTE: This is the path to the folder where index.js is. I.e. dist/server/src and not dist as I was hoping.
let __dirname = path.dirname(__filename); // TODO: __dirname will be "dist/server/src" int prod and "D:\GIT\ApanLoon\BambuMonitor\server\src\" in dev.

let wwwroot = "./wwwroot";
let projectArchive = "./projectArchive";

if (process.env.IS_DEVELOPMENT)
{
  __dirname = path.join(__dirname, "..");
  wwwroot = path.join("dist", wwwroot);
}

app.get("/config.json", (request, response) =>
{
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(
    {
      Host:        process.env.API_HOST  || "localhost",
      Port: Number(process.env.API_PORT) || 4000
    }
  ))
});
app.use("/",               express.static(path.join(__dirname, wwwroot)));
app.use("/projectArchive", express.static(path.join(__dirname, projectArchive)));

app.listen(webPort, () => {
  logger.Log(`[Web] Server is running at http://localhost:${webPort}`);
});

function sendState()
{
  api.sendPrinterConnectionStatus(bambuClient.IsConnected);
  api.sendStatus(bambuClient.status);
  api.sendPrinterLogLevel(bambuClient.LogLevel);
  api.sendCurrentJob(jobManager.CurrentJob);
}

function onPropertyChanged (change : Change)
{
  logger.LogChange(change);
  jobManager.HandleChange(change);
}
