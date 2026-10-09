import { Route } from "lib/types";

export const routes: Record<string, Route> = {
  'dashboard': {
    content: 'dashboard',
    title: "Dashboard",
    description: "",
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
