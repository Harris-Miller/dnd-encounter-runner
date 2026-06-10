export interface LandingReviewer {
  avatarSrc: string;
  handle: string;
  id: string;
  name: string;
  reviews: readonly [string, string, string];
}

export interface DisplayedReview {
  avatarSrc: string;
  handle: string;
  id: string;
  name: string;
  text: string;
}

const shuffle = <T>(arr: readonly T[]): T[] => {
  const result = [...arr];
  const len = result.length;
  for (let i = 0; i < len; i += 1) {
    const rand = i + Math.floor(Math.random() * (len - i));
    const value = result[rand]!;
    result[rand] = result[i]!;
    result[i] = value;
  }
  return result;
};

const LANDING_REVIEW_DISPLAY_COUNT = 8;

export const pickLandingReviews = (reviewers: readonly LandingReviewer[]): DisplayedReview[] => {
  const count = LANDING_REVIEW_DISPLAY_COUNT;

  if (count > reviewers.length) {
    throw new Error(`pickLandingReviews count ${String(count)} exceeds reviewer pool size ${String(reviewers.length)}`);
  }

  return shuffle(reviewers)
    .slice(0, LANDING_REVIEW_DISPLAY_COUNT)
    .map(reviewer => {
      const reviewIndex = Math.floor(Math.random() * reviewer.reviews.length);
      const text = reviewer.reviews[reviewIndex]!;

      return {
        avatarSrc: reviewer.avatarSrc,
        handle: reviewer.handle,
        id: reviewer.id,
        name: reviewer.name,
        text,
      };
    });
};
