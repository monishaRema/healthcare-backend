export interface IRegisterUserPayload{
    name:string,
    email:string,
    password:string,
    contactNumber?: string,
    address?: string,
    profilePhoto?: string
}
export interface ILoginUserPayload{
    email:string,
    password:string
}
