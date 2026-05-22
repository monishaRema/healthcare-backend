export interface IUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
  role: string;
  status: string;
  needPasswordChange: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null | undefined;
}

export interface ISession {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
}

export interface ISessionUser {
  session: ISession;
  user: IUser;
}
