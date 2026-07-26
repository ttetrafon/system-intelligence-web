import type { JWTPayload } from "util/lib/types";

export type SystemRole = 'owner' | 'admin' | 'user';
export type LoginType = 'email' | 'gmail';

export interface User {
  /**
   * The unique identifier for the user (UUID).
   * @format uuid
   */
  id: string | undefined;

  /**
   * The user's selected username.
   */
  username: string;

  loginType: LoginType;

  /**
   * The user's assigned color, represented as a hex number.
   */
  colour: string | '000000';

  system_role: SystemRole;
};

export interface DBUser {
  id: number;
  username: string;
  display: string | null;
  colour: string;
  system_role: string;
  password_hash: string | null;
}

export interface SiJwtPayload extends JWTPayload {
  display: string | null;
  loginType: string;
  system_role: string;
  colour: string;
}
