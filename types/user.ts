import type { JWTPayload } from "util/lib/types";

export type LoginType = 'email' | 'google';
export type GroupRole = 'gm' | 'writer' | 'player' | 'observer';
export type SystemRole = 'owner' | 'admin' | 'user';

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

  email: string;
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
  email: string;
  login_type: string;
  password_hash: string | null;
  system_role: string;
  colour: string;
}

// TODO: no need to keep `payload` and `session-user` separately, if we encrypt the jwt payload...
export interface SiJwtPayload extends JWTPayload {
  email: string;
  login_type: string;
  colour: string;
  system_role: SystemRole;
  // session_id: string
  // device_id: string
}
