import * as dotenv from 'dotenv';
dotenv.config();

export const jwtConstants = {
  get secret() {
    return process.env.JWT_SECRET;
  },
  get expirationTime() {
    return process.env.JWT_EXPIRESIN;
  },
};
export const jwtRefreshConstants = {
  get expirationTime() {
    return process.env.JWT_REFRESH_EXPIRES_IN;
  },
};
