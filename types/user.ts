import type { JWTPayload } from "util/lib/types";

export type SystemRole = 'owner' | 'admin' | 'user';
export type LoginType = 'email' | 'google';

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

// TODO: no need to keep `payload` and `session-user` separately, if we encrypt the jwt payload...
export interface SiJwtPayload extends JWTPayload {
  sub: number;
  display: string | null;
  loginType: string;
  system_role: SystemRole;
  colour: string;
}

export interface SessionUser extends SiJwtPayload {
}
