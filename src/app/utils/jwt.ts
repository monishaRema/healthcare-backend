
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';


export const jwtUtils = {
  createToken: (payload:JwtPayload,secret:string,{ expiresIn }: SignOptions) => {
    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
  },
  verifyToken: (token:string,secret:string) => {
   

    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return {
            success:true,
            decoded
        }
    } catch (error:unknown) {
        return{
            success:false,
            message:(error as Error).message,
            error
        }
    }
  },
  decodeToken: (token:string) => {
    return jwt.decode(token);
  }

}