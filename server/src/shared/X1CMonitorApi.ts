// Messages sent by the client to the server.
export const X1MonitorServerMessage = Object.freeze (
{
  GetState:           "GetState",
  SetLight:           "SetLight",
  GetPrinterLogLevel: "GetPrinterLogLevel",
  SetPrinterLogLevel: "SetPrinterLogLevel",
  RequestFullLog:     "RequestFullLog",
  RequestJobHistory:  "RequestJobHistory"
});

// Messages sent by the server to the client.
export const X1MonitorClientMessage = Object.freeze (
{
  Status:                  "Status",
  PrinterConnectionStatus: "PrinterConnectionStatus",
  PrinterLogLevel:         "PrinterLogLevel",
  MessageLogged:           "MessageLogged",
  CurrentJob:              "CurrentJob",
  JobHistory:              "JobHistory"
});
