import type { SiJwtPayload } from "@app-types/user";
import { env } from "cloudflare:workers";
import { getJwtPayload } from "util/lib-react/routes/loaders";
import { useEffect } from "react";
import { useUser } from "~/context/UserContext";
import { useLoaderData } from "react-router";
import type { Route } from "../../+types/root";

function loader({ request, context }: Route.LoaderArgs) {
  let jwtPayload = getJwtPayload<SiJwtPayload>(request, env.SESSION_SECRET);
  return { payload: jwtPayload };
}

export function AppWrapper(children: { children: React.ReactNode }) {
  const { setSession } = useUser();
  const loaderData = useLoaderData();

  useEffect(() => {
    console.log(loaderData, loaderData.payload);
    if (loaderData) {
      setSession(loaderData.payload);
    }
  }, [loaderData]);

  return <>
    {children}
  </>
}