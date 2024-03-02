
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

export class IpCam
{
    public ipcam_dev    : string = "1";       // "1"
    public ipcam_record : string = "enable";  // "enable"
    public mode_bits    : number = 2;         // 2
    public resolution   : string = "1080p";   // "1080p"
    public rtsp_url     : string = "disable"; // "disable"
    public timelapse    : string = "disable"; // "disable"
    public tutk_server  : string = "enable";  // "enable"
}

export class LightReport
{
    public mode : string = "on";            // "on", "flashing"
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
    public message                : string = ""; // ""
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


export class Print
{
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
    public command                    : string     = "";               // "push_status"
    public cooling_fan_speed          : string     = "0";              // "0"
    public ctt                        : number     = 0;                // 0
    public fail_reason                : string     = "0";              // "0"
    public fan_gear                   : number     = 0;                // 0
    public filam_bak                  : Array<any> = [];
    public force_upgrade              : boolean    = false;            // false
    public gcode_file                 : string     = "";               // ""
    public gcode_file_prepare_percent : string     = "0";              // "0"
    public gcode_start_time           : string     = "0";              // "0"
    public gcode_state                : string     = "IDLE";           // "IDLE"
    public heatbreak_fan_speed        : string     = "0";              // "0"
    public hms                        : Array<any> = [];
    public home_flag                  : number     = 0;                // 6407631
    public hw_switch_state            : number     = 0;                // 0
    public ip_cam                     : IpCam      = new IpCam;
    public job_id                     : string     = "";               // ""
    public layer_num                  : number     = 0;                // 0
    public lifecycle                  : string     = "";               // "product"
    public lights_report              : Array<LightReport> = [];
    public maintain                   : number     = 3;                // 3
    public mc_percent                 : number     = 0;                // 0
    public mc_print_errorCode         : string     = "0";              // "0"
    public mc_print_stage             : string     = "1";              // "1"
    public mc_print_sub_stage         : number     = 0;                // 0
    public mc_remaining_time          : number     = 0;                // 0
    public mess_production_state      : string     = "active";         // "active"
    public net                        : Net        = new Net;
    public nozzle_diameter            : string     = "0.4";            // "0.4"
    public nozzle_Target_temper       : number     = 0.0;              // 0.0
    public nozzle_temper              : number     = 25.0;             // 25.0
    public nozzle_type                : string     = "hardened_steel"; // "hardened_steel"
    public online                     : OnLine = new OnLine;
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
    public reason?                    : string;
    public result?                    : string;
    public return_code?               : number;
    public s_obj                      : Array<any> = [];
    public sdcard                     : boolean    = true;             // true
    public sequence_id                : string     = "2021";           // "2021"
    public spd_lvl                    : number     = 2;                // 2
    public spd_mag                    : number     = 100;              // 100
    public stg                        : Array<any> = [];
    public stg_cur                    : number     = -1;                // -1
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
