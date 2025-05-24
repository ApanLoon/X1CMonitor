import {XMLParser} from "fast-xml-parser";
import decompress from "decompress";
import { Client as FtpClient } from "basic-ftp";
import fs, { readFileSync } from "fs";
import Path from "path";
import { Project, Filament } from "../shared/Project.js"
import { X1Options } from "./X1Client.js";

export class BambuFtpOptions
{
  Port          : number = 990;
  LocalFilePath : string = "archive";
}

export class BambuFtpClient
{
    private _options : X1Options;
    private _ftpClient : FtpClient = new FtpClient();
    
    public constructor(options : X1Options)
    {
        this._options = options;
        try
        {
            // Check if local file path exists:
            if (fs.existsSync(this._options.FtpOptions.LocalFilePath))
            {
                if (fs.statSync(this._options.FtpOptions.LocalFilePath).isDirectory() == false)
                {
                    this._options.Logger?.Log("BambuFtpClient: Local file path exists but is not a directory. Ftp downloads will not work.");
                }
            }
            else
            {
                // Create the folder for local file storage:
                fs.mkdirSync(this._options.FtpOptions.LocalFilePath);
            }            
        }
        catch (err : any)
        {
            console.log("BambuFtpClient: ", err);
            //this._options.Logger?.Log("BambuFtpClient: ", err);
        }
    }

    public async DownloadProject (srcPath : string, prefix : string) : Promise<Project | null>
    {
        this._options.Logger?.Log(`BambuFtpClient: Trying to get file ftps://${this._options.UserName}@${this._options.Host}:${this._options.FtpOptions.Port}/${srcPath}`);
        try
        {
            await this._ftpClient.access(
            {
                host: this._options.Host,
                port: this._options.FtpOptions.Port,
                user: this._options.UserName,
                password: this._options.Password,
                secure: "implicit",
                secureOptions:
                {
                    rejectUnauthorized: false // TODO: Apparently we can not validate the certificate from the printer. Self-signed? Expired?
                }
            });

            const projectFile = `${prefix}-${srcPath.replace(/(\.gcode)(?!.*\1)/, "")}`;
            const projectPath = `${this._options.FtpOptions.LocalFilePath}/${projectFile}`; // TODO: Danger! You need to make sure that the resulting path is safe!
            await  this._ftpClient.downloadTo(projectPath, srcPath);

            // Unzip 3mf file:
            let p = Path.parse(projectPath);
            let dstFolder = Path.join(p.dir, p.name); // Remove extension 3mf
            await decompress(projectPath, dstFolder);

            let project : Project = new Project();

			this._options.Logger?.Log(`BambuFtpClient: File ftps://${this._options.UserName}@${this._options.Host}:${this._options.FtpOptions.Port}/${srcPath} unpacked. Reading project settings...`);

            // Read project_settings.config:
            const projectSettings = JSON.parse(await fs.promises.readFile(Path.join(dstFolder, "Metadata", "project_settings.config"), "utf-8"));
            project.SettingsName = projectSettings?.print_settings_id;

			this._options.Logger?.Log(`BambuFtpClient: File ftps://${this._options.UserName}@${this._options.Host}:${this._options.FtpOptions.Port}/${srcPath} project settings read. Reading model settings...`);

            // Read model_settings.config:
            const modelSettingsParser = new XMLParser(
                {
                    ignoreAttributes: false,
                    attributeNamePrefix: "",
                    isArray: (tagName : string) => {return tagName === "plate" }
                });
            const modelSettings = modelSettingsParser.parse(readFileSync(Path.join(dstFolder, "Metadata", "model_settings.config")));

            // Map metadata key/value to plate objects:
            const plates = modelSettings.config.plate.map( (x : { metadata : Array<{ key: string; value: string; }> }) => Object.fromEntries(x.metadata.map((g: { key: string; value: string; } ) => [g.key, g.value])));

            // Find the first plate that has a gcode file:
            const plate = plates.find((x : { gcode_file : string; thumbnail_file : string; }) => x.gcode_file !== "");
            project.PlateName = plate?.plater_name;
            project.ThumbnailFile = Path.join(dstFolder, plate?.thumbnail_file);

			this._options.Logger?.Log(`BambuFtpClient: File ftps://${this._options.UserName}@${this._options.Host}:${this._options.FtpOptions.Port}/${srcPath} model settings read. Reading slice info...`);

            // Read slice_info.config:
            const sliceInfoParser = new XMLParser(
                {
                    ignoreAttributes: false,
                    attributeNamePrefix: "",
                    isArray: (tagName : string) => { return ["metadata", "object", "filament"].includes (tagName) }
                });
            const sliceInfo = sliceInfoParser.parse(readFileSync(Path.join(dstFolder, "Metadata", "slice_info.config")));

            const metadata = Object.fromEntries(sliceInfo?.config?.plate?.metadata?.map((g: { key: string; value: string; } ) => [g.key, g.value]));
            project.PlateIndex = Number(metadata?.index);
            project.TotalWeight = Number(metadata?.weight);
            project.Filaments = sliceInfo?.config?.plate?.filament?.map ((x:any) => ({ TrayId: Number(x.id), Type: x.type, Colour: x.color, UsedLength: Number(x.used_m), UsedWeight: Number(x.used_g) }));

			this._options.Logger?.Log(`BambuFtpClient: File ftps://${this._options.UserName}@${this._options.Host}:${this._options.FtpOptions.Port}/${srcPath} read successfully.`);

            return project;
        }
        catch (err : any)
        {
            console.log("BambuFtpClient: ", err);
            //this._options.Logger?.Log("BambuFtpClient: ", err);
            return null;
        }
    }
}
