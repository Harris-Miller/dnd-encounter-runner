export const hasProfileName = (name: null | string | undefined): boolean => {
  return name != null && name.trim() !== '';
};
