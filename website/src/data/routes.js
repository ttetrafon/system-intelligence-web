import { editablePageOperationNames } from "./enums"

export const routes = {
  '/': {
    content: "si-editable-page",
    title: "System Intelligence",
    description: "System Intelligence Web App",
    path: "/",
    pathType: "WebPage",
    navData: {
      pageData: "introduction",
      saveOn: `${editablePageOperationNames.SAVE_ON_LINE_UPDATED.description}`,
      dataSubscriptions: []
    }
  },
  '/gameplay': {
    content: "si-editable-page",
    title: "System Intelligence: Gameplay",
    description: "System Intelligence Web App",
    path: "/gameplay",
    pathType: "WebPage",
    navData: {
      pageData: "gameplay",
      saveOn: `${editablePageOperationNames.SAVE_ON_LINE_UPDATED.description}`,
      dataSubscriptions: []
    }
  },
  '/404': {
    content: "page-404",
    title: "404 - Page not found",
    description: "The page you request was not found!",
    path: "/404",
    pathType: "WebPage"
  }
}

export const aliases = {
  '/introduction': '/'
}
