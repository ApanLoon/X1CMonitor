export interface IMessage
{
    command     : string;
    reason?     : string;
    result?     : string;
    reurn_code? : number;
    sequence_id : string;
}

