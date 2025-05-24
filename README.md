# X1CMonitor
Listens to, logs and presents messages on the MQTT bus of a Bambu Lab X1 Carbon 3D printer.

The server component remains connected to the printer at all times and logs changes in the printer state to a log file. It also detects when print jobs start and stop, downloads the project files from the printer and stores a print history in a database.

The client component is a web application showing detailed printer and AMS status, gives access to the printer camera and displays the print history (Including preview image and estimated filament usage).

# Architecture
The application is separated into two npm projects, one server and one client. The server is a Node typescriptapplication that hosts the client as well as an API that can be used to access the information retrieved from the printer.

The client is a stand-alone vue typescript application that communicates with the server and presents information about the printer.

The server can also start an external ffmpeg process that converts and relays the video stream of the printer camera in a format that the client can consume.

## Folders
```bash
+---client
|   +---public
|   \---src
|       +---assets
|       +---components
|       |   +---generic
|       |   +---icons
|       |   \---pages
|       +---lib
|       |   \---jsmpeg
|       \---plugins
+---images
\---server
    +---dist
    |   +---wwwroot
    +---logs
    +---projectArchive
    \---src
        +---shared
```
The client/public folder contains a static file "config.json", this file is only used when hosting the client with vite, i.e. with "npm run dev". When the client is hosted from the server, the config.json file is dynamically generated to accurately point the client to the correct server.

The client/src/lib/jsmpeg folder contains a modified version of the [jsmpeg](https://github.com/phoboslab/jsmpeg) library. This uses a webassembly built with [emscripten](https://emscripten.org/).

When building the client ("npm run build") the output is stored in "server/dist/wwwroot".

The "server/src/shared" folder contains the API definition and data types used by both server and client.

The "server/logs" folder is the default location of the server log file.

The "server/projectArchive" folder is the default location for storing the project files downloaded from the printer. When hosting the client with vite, this folder is also hosted statically so that the client can access the preview images.

## Running in dev mode
1. In the server folder, run "npm run dev". This starts the server and monitors source files for changes.
1. In the client folder, run "npm run dev". This hosts the vue application with vite and uses a config.json that points to the local server

## Docker
To build a docker image of the x1cmonitor,
1. Clear out the "server/dist/wwwroot" folder manually or add "--emptyOutDir" to your build command.
1. In the client folder, run "npm run build". This will create the client files in the "server/dist/wwwroot" folder
1. In the server folder, run "npm run build". This will build the server application into "server/dist"
1. In the server folder run "docker-compose up -d --build". 

## Configuration
The server is configured using environment variables. Typically use a .env (docker.env for the container) file with the following variables:

| Variable | Description | Default value |
| -------- | ----------- | ------------- |
| IS_DEVELOPMENT | When TRUE, the server will modify some paths to properly host the client and project files | FALSE |
| X1C_HOST | IP-address or host name of the printer to connect to | |
| ~~X1C_PORT~~ | ~~Port number for the MQTT server on the printer~~ | 8883 |
| X1C_PASSWORD | Password for the printer (as shown in "Settings/General/LAN Only/Access code" on the printer display) |
| X1C_SERIAL | The serial number of the printer (As shown in "Settings/General/Device info" on the printer display) |
| WEB_PORT | Port number of the server hosting the client | 3000 |
| API_HOST | Host name or IP-address of the server API | localhost |
| API_PORT | Port of the server API | 4000 |
| DB_HOST  | Host name or IP-address of the mongodb database storing the job history | |
| DB_PORT  | Port of the mongodb database | 27017 |
| DB_NAME  | Name of the database | X1CMonitor |
| DB_USER  | Username for accessing the database | x1cmonitor |
| DB_PWD   | Password for accessing the database | |