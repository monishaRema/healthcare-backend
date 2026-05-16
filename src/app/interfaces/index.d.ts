import { IRequestUser } from "./reqUser.interface";

declare global {
    namespace Express {
        interface Request {
            user?:IRequestUser
        }
    }
}