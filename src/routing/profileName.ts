export const hasProfileName = (name: string | null | undefined): boolean => {
  return name != null && name.trim() !== '';
};
