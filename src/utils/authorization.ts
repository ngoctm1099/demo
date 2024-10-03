export const authorizeFeatures = (user, moduleIndex, roleActionIndex) =>
  user?.role?.roleValues[moduleIndex][roleActionIndex] === "1";
