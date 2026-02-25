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
