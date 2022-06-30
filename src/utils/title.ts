export const wrapTitleInTemplate = (taskTitle: string) => {
  return "Do this now: ❗" + (taskTitle || "N/A") + "❗";
};
