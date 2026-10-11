import { Route } from "lib/types";

export const routes: Record<string, Route> = {
  'dashboard': {
    content: 'si-dashboard',
    title: "SI: Dashboard",
    description: "System Intelligence Web-App: user dashboard page",
    pathType: "WebPage",
    navData: {}
  },
  '404': {
    content: "page-404",
    title: "404 - Page not found",
    description: "The page you request was not found!",
    pathType: "WebPage"
  }
}

export const aliases: Record<string, string> = {
  '/': '/dashboard'
}
