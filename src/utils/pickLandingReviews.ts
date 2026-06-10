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

const shuffleReviewers = <T>(items: readonly T[], random: () => number): T[] => {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const currentItem = shuffledItems[index];
    const swapItem = shuffledItems[swapIndex];

    if (currentItem === undefined || swapItem === undefined) {
      throw new Error('shuffleReviewers encountered an undefined item while shuffling reviewers');
    }

    shuffledItems[index] = swapItem;
    shuffledItems[swapIndex] = currentItem;
  }

  return shuffledItems;
};

export const pickLandingReviews = (
  reviewers: readonly LandingReviewer[],
  options: { count: number; random: () => number },
): DisplayedReview[] => {
  const { count, random } = options;

  if (count > reviewers.length) {
    throw new Error(`pickLandingReviews count ${String(count)} exceeds reviewer pool size ${String(reviewers.length)}`);
  }

  return shuffleReviewers(reviewers, random)
    .slice(0, count)
    .map(reviewer => {
      const reviewIndex = Math.floor(random() * reviewer.reviews.length);
      const text = reviewer.reviews[reviewIndex];

      if (text === undefined) {
        throw new Error(`Reviewer ${reviewer.id} is missing review at index ${String(reviewIndex)}`);
      }

      return {
        avatarSrc: reviewer.avatarSrc,
        handle: reviewer.handle,
        id: reviewer.id,
        name: reviewer.name,
        text,
      };
    });
};
