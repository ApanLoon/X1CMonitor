/*
export enum AmsRfidState
{
    INIT,
    LOADING,
    DONE,
};

export enum AmsStep
{
    INIT,
    HEAT_EXTRUDER,
    LOADING,
    COMPLETED,
};

export enum AmsRoadPosition
{
    TRAY,     // filament at tray
    TUBE,     // filament at tube
    HOTEND,   // filament at hotend
};
*/

export enum AmsStatusMain
{
    IDLE                = 0x00,
    FILAMENT_CHANGE     = 0x01,
    RFID_IDENTIFYING    = 0x02,
    ASSIST              = 0x03,
    CALIBRATION         = 0x04,
    SELF_CHECK          = 0x10,
    DEBUG               = 0x20,
    UNKNOWN             = 0xFF,
};

export enum AmsRfidStatus
{
    IDLE           = 0,
    READING        = 1,
    GCODE_TRANS    = 2,
    GCODE_RUNNING  = 3,
    ASSITANT       = 4,
    SWITCH_FILAMENT= 5,
    HAS_FILAMENT   = 6
};

/*
export enum AmsOptionType
{
    STARTUP_READ,
    TRAY_READ,
    CALIBRATE_REMAIN
};
*/

export class Tray
{
    public bed_temp        : string = "0"; // "35"
    public bed_temp_type   : string = "1";
    public cali_idx        : number = -1;
    public cols            : Array<string> = []; // RGBA "8E9089FF"
    public c_type          : number = 0;
    public drying_temp     : string = "0"; // "55"
    public drying_time     : string = "0"; // "8"
    public id              : string = "0"; // "0"
    public nozzle_temp_max : string = "0"; // "230"
    public nozzle_temp_min : string = "0"; // "190"
    public remain          : number = 0;   // 42
    public tag_uid         : string = "";  // "4CC0983900000100"
    public tray_color      : string = "";  // RGBA "8E9089FF"
    public tray_diameter   : string = "0"; // "1.75"
    public tray_id_name    : string = "";  // "A00-D0"
    public tray_info_idx   : string = "";  // "GFA00"
    public tray_sub_brands : string = "";  // "PLA Basic"
    public tray_type       : string = "";  // "PLA"
    public tray_uuid       : string = "";  // "D046EF8FB5204757B64FEA3C90357E2C",
    public tray_weight     : string = "";  // "1000"
    public xcam_info       : string = "";  // "D007D007E803E8039A99193F"
}

export class AmsInstance
{
    public humidity : string = "";  // "5"
    public id       : string = "0"; // "0",
    public temp     : string = "0"; // "26.9"
    public tray     : Array<Tray> = [];
}

export class Ams
{
    public ams                 : Array<AmsInstance> = [];
    public ams_exist_bits      : string = "0";   // "1"
    public insert_flag         : boolean = true; // true
    public power_on_flag       : boolean = true; // true
    public tray_exist_bits     : string = "0";   // "f"
    public tray_is_bbl_bits    : string = "0";   // "f"
    public tray_now            : string = "255"; // "255"
    public tray_pre            : string = "255"; // "255"
    public tray_read_done_bits : string = "0";   // "f"
    public tray_reading_bits   : string = "0";   // "0",
    public tray_tar            : string = "255"; // "255"
    public version             : number = 0;     // 420
}

export const AmsStatus2String = (status : number) =>
{
    let ams_status_sub = status & 0xFF;
    let ams_status_main_int = (status & 0xFF00) >> 8;

    return `${AmsStatusMain[ams_status_main_int]}:${ams_status_sub}`;
}
