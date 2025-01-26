export const requestPermissionMappings = {
};

export const userRolesPermissions = {
};

export function isDev() {
  // Determine if this is running locally
  // TODO: currently working on windows, better use something on the server - specific env variable?
  let operatingSystem = process.platform;
  return operatingSystem.startsWith("win");
}
