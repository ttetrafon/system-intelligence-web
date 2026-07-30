import type { JWTPayload } from "util/lib/types";

export interface RootLoaderData<T extends JWTPayload> {
  payload: T | null;
}
