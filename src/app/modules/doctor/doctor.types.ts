import { Gender } from "../../../generated/prisma/enums";


export interface IUpdateDoctorSpecialtyPayload {
    specialtyId: string;
    shouldDelete?: boolean;
}
export interface IUpdateDoctorPayload {
    doctor?: {
        name?: string;
        profilePhoto?: string;
        contactNumber?: string;
        address?: string;
        experience?: number
        registrationNumber?: string;
        gender?: Gender;
        appointmentFee?: number;
        qualification?: string;
        currentWorkingPlace?: string;
        designation?: string;
    },
    specialties?: IUpdateDoctorSpecialtyPayload[];
}

export interface IUpdateDoctor {
  name?: string;
  email?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  registrationNumber?: string;
  experience?: number;
  gender?: Gender;
  appointmentFee?: number;
  qualification?: string;
  currentWorkingPlace?: string;
  designation?: string;
  specialties?: string[]; // Array of specialty IDs to update
}
