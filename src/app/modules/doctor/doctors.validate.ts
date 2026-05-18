import z from "zod";

export const updateDoctorValidationSchema = z.object({
  name: z.string().min(1).optional(),
  profilePhoto: z.url("Invalid URL format").optional(),
  contactNumber: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  experience: z.number().int().min(0).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  appointmentFee: z.number().positive().optional(),
  qualification: z.string().min(1).optional(),
  currentWorkingPlace: z.string().min(1).optional(),
  designation: z.string().min(1).optional(),
  specialties: z.array(z.uuid("Each specialty ID must be a valid UUID")).optional(),
})
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type UpdateDoctorValidationSchemaType = z.infer<
  typeof updateDoctorValidationSchema
>;
