export type UserRole = 'gm' | 'writer' | 'player' | 'observer';
export type LoginType = 'email' | 'gmail' | 'none';

/**
 * Represents a user in the system.
 */
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
   * The user's role within the system.
   */
  role: UserRole | 'observer';

  /**
   * The user's assigned color, represented as a hex number (e.g., 0xFF0000 for red).
   */
  colour: string | '000000'; //
}
