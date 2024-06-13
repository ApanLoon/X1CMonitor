import { Ams, Tray } from "./AmsTypes";

export class NozzleInfo
{
    public info : number = 0;
    public temp : number = 0;
}
export class Nozzle
{
    [key : string] : number | NozzleInfo;
}

export class Device
{
    public fan : number = 0;
    public nozzle : Nozzle = {};
}

export class IpCam
{
    public agora_service : string = "disable"; // "disable"
    public ipcam_dev    : string = "1";        // "1"
    public ipcam_record : string = "enable";   // "enable"
    public mode_bits    : number = 2;          // 2
    public resolution   : string = "1080p";    // "1080p"
    public rtsp_url     : string = "disable";  // "disable"
    public timelapse    : string = "disable";  // "disable"
    public tutk_server  : string = "enable";   // "enable"
}

export class LightReport
{
    public mode : string = "on";            // "on", "off", "flashing"
    public node : string = "chamber_light"; // "chamber_light", "work_light"
}

export class NetInfo
{
    public ip   : number = 0; // 32 bit unsigned integer IP v4 address
    public mask : number = 0;
}

export class Net
{
    public conf  : number = 16; // 16
    public info  : Array<NetInfo> = [];
}

export class OnLine
{
    public ahb     : boolean = false; // false
    public ext     : boolean = false; // false
    public version : number  = 7;     // 7
}

export class UpgradeState
{
    public ahb_new_version_number : string = ""; // ""
    public ams_new_version_number : string = ""; // ""
    public consistency_request    : boolean = false; // false
    public dis_state              : number = 0; // 0
    public err_code               : number = 0; // 0
    public ext_new_version_number : string = ""; // ""
    public force_upgrade          : boolean = false; // false
    public idx                    : number = 7; // 7
    public idx1                   : number = 0; // 0
    public message                : string = ""; // "verifying: filament"
    public module                 : string = "null"; // "null"
    public new_version_state      : number = 2; // 2
    public ota_new_version_number : string = ""; // ""
    public progress               : string = "0"; // "0"
    public sequence_id            : number = 0; // 0
    public sn                     : string = "";
    public status                 : string = "IDLE"; // "IDLE"
}

export class Upload
{
    public file_size       : number = 0;      // 0
    public finish_size     : number = 0;      // 0
    public message         : string = "Good"; // "Good"
    public oss_url         : string = "";     // ""
    public progress        : number = 0;      // 0
    public sequence_id     : string = "0903"; // "0903"
    public speed           : number = 0;      // 0
    public status          : string = "idle"; // "idle"
    public task_id         : string = "";     // ""
    public time_remaining  : number = 0;      // 0
    public trouble_id      : string = "";     // ""
}

export class Xcam
{
    public allow_skip_parts           : boolean = false;    // false
    public buildplate_marker_detector : boolean = true;     // true
    public first_layer_inspector      : boolean = true;     // true
    public halt_print_sensitivity     : string  = "medium"; // "medium"
    public print_halt                 : boolean = true;     // true
    public printing_monitor           : boolean = true;     // true
    public spaghetti_detector         : boolean = true;     // true
}

export enum Stage
{
    ""                                                =  0,
    "Auto bed leveling"                               =  1,
    "Heatbed preheating"                              =  2,
    "Sweeping XY mech mode"                           =  3,
    "Changing filament"                               =  4,
    "M400 pause"                                      =  5,
    "Paused due to filament runout"                   =  6,
    "Heating hotend"                                  =  7,
    "Calibrating extrusion"                           =  8,
    "Scanning bed surface"                            =  9,
    "Inspecting first layer"                          = 10,
    "Identifying build plate type"                    = 11,
    "Calibrating Micro Lidar"                         = 12,
    "Homing toolhead"                                 = 13,
    "Cleaning nozzle tip"                             = 14,
    "Checking extruder temperature"                   = 15,
    "Printing was paused by the user"                 = 16,
    "Pause of front cover falling"                    = 17,
    "Calibrating the micro lida"                      = 18,
    "Calibrating extrusion flow"                      = 19,
    "Paused due to nozzle temperature malfunction"    = 20,
    "Paused due to heat bed temperature malfunction"  = 21,
    "Filament unloading"                              = 22,
    "Skip step pause"                                 = 23,
    "Filament loading"                                = 24,
    "Motor noise calibration"                         = 25,
    "Paused due to AMS lost"                          = 26,
    "Paused due to low speed of the heat break fan"   = 27,
    "Paused due to chamber temperature control error" = 28,
    "Cooling chamber"                                 = 29,
    "Paused by the Gcode inserted by user"            = 30,
    "Motor noise showoff"                             = 31,
    "Nozzle filament covered detected pause"          = 32,
    "Cutter error pause"                              = 33,
    "First layer error pause"                         = 34,
    "Nozzle clog pause"                               = 35
}



// Messages:
//

export interface IPrinterMessage
{
    command     : string;
    reason?     : string;
    result?     : string;
    reurn_code? : number;
    sequence_id : string;
}

export class Status implements IPrinterMessage
{
    public command                    : string     = "";               // "push_status"
    public reason?                    : string;
    public result?                    : string;
    public return_code?               : number;

    public ams                        : Ams        = new Ams;
    public ams_rfid_status            : number     = 0;                // 0
    public ams_status                 : number     = 0;                // 0
    public aux_part_fan               : boolean    = true;             // true
    public bed_target_temper          : number     = 0;                // 0.0
    public bed_temper                 : number     = 0;                // 22.0
    public big_fan1_speed             : string     = "0";              // "0"
    public big_fan2_speed             : string     = "0";              // "0"
    public cali_version               : number     = 0;                // 0
    public chamber_temper             : number     = 0;                // 25.0
    public cooling_fan_speed          : string     = "0";              // "0"
    public ctt                        : number     = 0;                // 0
    public device                     : Device     = {fan : 0, nozzle: {}};
    public fail_reason                : string     = "";               // "0"
    public fan_gear                   : number     = 0;                // 0
    public filam_bak                  : Array<any> = [];
    public force_upgrade              : boolean    = false;            // false
    public gcode_file                 : string     = "";               // ""
    public gcode_file_prepare_percent : string     = "0";              // "0"
    
    // Has this been removed?
    public gcode_start_time           : string     = "0";              // "0"

    public gcode_state                : string     = "IDLE";           // "IDLE", "PAUSE", "RUNNING", "SLICING", "PREPARE", "FINISH", "FAILED"
    public heatbreak_fan_speed        : string     = "0";              // "0"
    public hms                        : Array<any> = [];
    public home_flag                  : number     = 0;                // 6407631
    public hw_switch_state            : number     = 0;                // 0
    public ip_cam                     : IpCam      = new IpCam;
    public job_id                     : string     = "";               // ""
    public layer_num                  : number     = 0;                // 0
    public lifecycle                  : string     = "";               // "product"
    public lights_report              : Array<LightReport> = [];
    public maintain                   : number     = 0;                // maintenance code: 3 = ?, 131075 = Lead screws need lubricant 
    public mc_percent                 : number     = 0;                // 0
    public mc_print_errorCode         : string     = "0";              // "0"
    public mc_print_stage             : string     = "1";              // "1"
    public mc_print_sub_stage         : number     = 0;                // 0
    public mc_remaining_time          : number     = 0;                // 0

    // Has this been removed?
    public mess_production_state      : string     = "active";         // "active"

    public net                        : Net        = new Net;
    public nozzle_diameter            : string     = "0.4";            // "0.4"
    public nozzle_target_temper       : number     = 0.0;              // 0.0
    public nozzle_temper              : number     = 25.0;             // 25.0
    public nozzle_type                : string     = "hardened_steel"; // "hardened_steel"
    public online                     : OnLine = new OnLine;
    
    // Has this been removed?
    public param?                     : string;

    public print_error                : number     = 0;                // 0
    public print_gcode_action         : number     = 0;                // 0
    public print_real_action          : number     = 0;                // 0
    public print_type                 : string     = "";               // ""
    public profile_id                 : string     = "";               // ""
    public project_id                 : string     = "";               // ""
    public queue_est                  : number     = 0;                // 0
    public queue_number               : number     = 0;                // 0
    public queue_sts                  : number     = 0;                // 0
    public queue_total                : number     = 0;                // 0
    public s_obj                      : Array<any> = [];
    public sdcard                     : boolean    = true;             // true
    public sequence_id                : string     = "2021";           // "2021"
    public spd_lvl                    : number     = 2;                // 2
    public spd_mag                    : number     = 100;              // 100
    public stg                        : Array<any> = [];               // Queue of "Stage"
    public stg_cur                    : number     = -1;               // "Stage"
    public subtask_id                 : string     = "";               // ""
    public subtask_name               : string     = "";               // ""
    public task_id                    : string     = "";               // ""
    public total_layer_num            : number     = 0;                // 0
    public upgrade_state              : UpgradeState = new UpgradeState;
    public upload                     : Upload       = new Upload;
    public user_id?                   : string;
    public vt_tray                    : Tray         = new Tray;
    public wifi_signal                : string       = "";             // "-37dBm"
    public xcam                       : Xcam         = new Xcam;
    public xcam_status                : string       = "0";            // "0"
}
