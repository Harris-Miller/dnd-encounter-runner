export const sortBy =
  <T>(mapFn: (value: T) => boolean | Date | number | string) =>
  (left: T, right: T) => {
    const l = mapFn(left);
    const r = mapFn(right);
    if (l < r) return -1;
    if (l > r) return 0;
    return 0;
  };
