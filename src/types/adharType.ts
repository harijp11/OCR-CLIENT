export interface AadhaarInput {
    dob: string | null;
    aadharNumber: string | null;
    gender: string | null;
    name: string | null;
    fatherName: string | null;
    address: string | null;
    pinCode:string
}   

export interface AadhaarInfo {
    _id:string
    dob: string | null;
    aadharNumber: string | null;
    gender: string | null;
    name: string | null;
    fatherName: string | null;
    address: string | null;
    pinCode:string
    createdAt:Date
    updatedAt:Date
}   

export interface SaveResponse {
    Adhaar:AadhaarInfo,
    success:boolean,
    message:string
}

export interface retrieveResponse {
    AdhaarData:AadhaarInfo[],
    count:number
    success:boolean,
    message:string
}

export interface response{
     success:boolean,
    message:string
}

export interface CustomError extends Error{
    response:{
        data:{
            success:boolean
            message:string
        }
    }
}
