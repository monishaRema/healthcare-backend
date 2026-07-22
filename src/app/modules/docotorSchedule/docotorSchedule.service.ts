import { DoctorSchedules } from "../../../generated/prisma/browser";
import { Prisma } from "../../../generated/prisma/client";
import { IQueryParams } from "../../interfaces/query.interface";
import { IRequestUser } from "../../interfaces/reqUser.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { doctorScheduleIncludeConfig, doctorScheduleSearchableFields } from "./docotorSchedule.constant";
import { ICreateDoctorSchedulePayload, IUpdateDoctorSchedulePayload } from "./doctorSchedule.interface";

export const doctorScheduleService = {
  createMyDoctorSchedule: async (user: IRequestUser, payload: ICreateDoctorSchedulePayload) => {
    const doctorData = await prisma.doctor.findUnique({
      where: {
        email: user.email,
      },
    });

    const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
      doctorId: doctorData?.id as string,
      scheduleId,
    }))

    const reslut = await prisma.doctorSchedules.createMany({
      data: doctorScheduleData,
      
    });

    return reslut;
  },

  getMyDoctorSchedules: async (user: IRequestUser, query: IQueryParams) => {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      },
    });
      const queryBuilder = new QueryBuilder<DoctorSchedules, Prisma.DoctorSchedulesWhereInput, Prisma.DoctorSchedulesInclude>(prisma.doctorSchedules,
    {
    doctorId: doctorData.id,
    ...query
    }, 
    {
        filterableFields: doctorScheduleSearchableFields,
        searchableFields: doctorScheduleSearchableFields
    })
    const doctorSchedules = await queryBuilder
    .search()
    .filter()
    .paginate()
    .include({
        schedule: true,
        doctor : {
            include:{
                user: true,
            }
        }
    })
    .sort()
    .fields()
    .dynamicInclude(doctorScheduleIncludeConfig)
    .execute();
    return doctorSchedules;
  },

  getAllDoctorSchedules: async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<DoctorSchedules, Prisma.DoctorSchedulesWhereInput, Prisma.DoctorSchedulesInclude>(
      prisma.doctorSchedules,
      query,
      {
        filterableFields: doctorScheduleSearchableFields,
        searchableFields: doctorScheduleSearchableFields,
      },
    );

    const doctorSchedules = await queryBuilder
      .search()
      .filter()
      .paginate()
      .include({
        schedule: true,
        doctor: {
          include: {
            user: true,
          },
        },
      })
      .sort()
      .fields()
      .dynamicInclude(doctorScheduleIncludeConfig)
      .execute();

    return doctorSchedules;
  },

  getDoctorScheduleById: async (doctorId: string, scheduleId: string) => {
    const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
      where: {
        doctorId_scheduleId: {
          doctorId,
          scheduleId,
        },
      },
      include: {
        schedule: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    return doctorSchedule;
  },

  updateMyDoctorSchedule: async (user: IRequestUser, payload: IUpdateDoctorSchedulePayload) => {
     const doctorData = await prisma.doctor.findUniqueOrThrow({
            where:{
                email : user.email
            }
        });

        const deleteIds = payload.scheduleIds.filter(schedule => schedule.shouldDelete).map(schedule => schedule.id);

        const createIds = payload.scheduleIds.filter(schedule => !schedule.shouldDelete).map(schedule => schedule.id);

        const result = await prisma.$transaction(async (tx) => {

            await tx.doctorSchedules.deleteMany({
                where : {
                    isBooked: false,
                    doctorId : doctorData.id,
                    scheduleId : {
                        in : deleteIds
                    }
                }
            });

            const doctorScheduleData = createIds.map((scheduleId) => ({
                doctorId : doctorData.id,
                scheduleId
            }) )

            const result = await tx.doctorSchedules.createMany({
                data : doctorScheduleData
            });

            return result;
        })

        return result;
  },

  deleteMyDoctorSchedule: async (id: string, user: IRequestUser) => {

  },
};
