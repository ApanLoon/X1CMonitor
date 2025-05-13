import { MongoClient } from "mongodb";
import { Logger } from "../Logger/Logger.js";
import EventEmitter from "events";
import { Job } from "../shared/Job.js";

export class DatabaseOptions
{
  Logger?  : Logger;
  Host     : string = "localhost";
  Port     : number = 27017;
  Database : string = "X1CMonitor";
  UserName : string = "x1cmonitor";
  Password : string = "";
}

export const DatabaseEvent = Object.freeze (
{
    ConnectionChanged:  "connection-changed"
});

export class Database extends EventEmitter
{
    public IsConnected : boolean = false;
    
    private _options : DatabaseOptions = new DatabaseOptions;
    private _client; 
    
      public constructor(options : Partial<DatabaseOptions>)
      {
        super();
        Object.assign(this._options, options);
        this._client = new MongoClient(this.createConnectionUrl());
      }
      
      public async Connect()
      {
        try
        {
            await this._client.connect();
            await this._client.db("admin").command({ ping: 1 });
            this._options.Logger?.Log ("[Database] Connect successful.");
        }
        catch (err)
        {
            this._options.Logger?.Log(`[Database] Connection failed. ${err}`);
        }
      }

      public Close()
      {
        this._client.close();
      }

      public async GetJobHistory()
      {
        try
        {
          const db = this._client.db();
          const collection = db.collection("Job");
          const cursor = collection.find<Job> ({}).sort({ StartTime: -1 });
          return await cursor.toArray();
        }
        catch (err)
        {
          this._options.Logger?.Log(`[Database] UpdateJob failed. ${err}`);
        }
        return null;
    }

      public async UpdateJob (job : Job | null)
      {
        if (job === null)
        {
            return;
        }

        try
        {
            const db = this._client.db();
            const collection = db.collection("Job");
            await collection.updateOne (
                { id: job.Id },
                { $set: job },
                { upsert: true }
            );
        }
        catch (err)
        {
            this._options.Logger?.Log(`[Database] UpdateJob failed. ${err}`);
        }
      }

      private createConnectionUrl() : string
      {
        return `mongodb://${encodeURI(this._options.UserName)}:${encodeURI(this._options.Password)}@${this._options.Host}:${this._options.Port}/${encodeURI(this._options.Database)}`;
      }

}