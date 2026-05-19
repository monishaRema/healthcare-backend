export interface IRegisterUserPayload {
  name: string;
  email: string;
  password: string;
  contactNumber?: string;
  address?: string;
  profilePhoto?: string;
}
export interface IRegisterPatientPayload {
  name: string;
  email: string;
  contactNumber?: string;
  address?: string;
  profilePhoto?: string;
  userId: string;
}
export interface ILoginUserPayload {
  email: string;
  password: string;
}
export interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}
