export class Project
{
    public SettingsName : string = "";
    public PlateIndex : number = 0;
    public PlateName : string = "";
    public ThumbnailFile : string = "";
    public TotalWeight : number = 0;
    public Filaments : Array<Filament> = [];
}

export class Filament
{
    public TrayId        : number = 0;
    public Type          : string = "";
    public Colour        : string = "";
    public IsBBL         : boolean = false;
    public BrandFamily   : string = "";
    public BrandFamilyId : string = "";
    public BrandId       : string = "";
    public Uuid          : string = "";
    public UsedLength    : number = 0; // Metres
    public UsedWeight    : number = 0; // Grammes
}
