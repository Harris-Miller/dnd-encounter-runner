import { describe, expect, it } from 'vitest';

import { LANDING_REVIEWERS } from '../../data/landingReviews';
import { pickLandingReviews } from '../pickLandingReviews';

const createSeededRandom = (values: readonly number[]) => {
  let index = 0;

  return () => {
    const value = values[index];

    if (value === undefined) {
      throw new Error('createSeededRandom ran out of seeded values');
    }

    index += 1;
    return value;
  };
};

describe('pickLandingReviews', () => {
  it('returns exactly 10 reviews from the landing reviewer pool', () => {
    const reviews = pickLandingReviews(LANDING_REVIEWERS, {
      count: 10,
      random: Math.random,
    });

    expect(reviews).toHaveLength(10);
  });

  it('returns at most one review per person', () => {
    const reviews = pickLandingReviews(LANDING_REVIEWERS, {
      count: 10,
      random: Math.random,
    });

    const uniqueReviewerIds = new Set(reviews.map(review => review.id));

    expect(uniqueReviewerIds.size).toBe(reviews.length);
  });

  it("selects review text from that reviewer's three options", () => {
    const reviews = pickLandingReviews(LANDING_REVIEWERS, {
      count: 10,
      random: Math.random,
    });

    reviews.forEach(review => {
      const reviewer = LANDING_REVIEWERS.find(entry => entry.id === review.id);

      expect(reviewer).toBeDefined();
      expect(reviewer?.reviews).toContain(review.text);
    });
  });

  it('is deterministic when random is seeded', () => {
    const seededValues = Array.from({ length: 29 }, (_, index) => (index + 1) / 30);
    const seededRandom = createSeededRandom(seededValues);

    const firstPass = pickLandingReviews(LANDING_REVIEWERS, {
      count: 10,
      random: seededRandom,
    });

    const secondPass = pickLandingReviews(LANDING_REVIEWERS, {
      count: 10,
      random: createSeededRandom(seededValues),
    });

    expect(secondPass).toEqual(firstPass);
  });

  it('throws when count exceeds reviewer pool size', () => {
    expect(() =>
      pickLandingReviews(LANDING_REVIEWERS, {
        count: LANDING_REVIEWERS.length + 1,
        random: () => 0,
      }),
    ).toThrow(/exceeds reviewer pool size/);
  });
});
