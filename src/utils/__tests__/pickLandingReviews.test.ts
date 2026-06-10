import { afterEach, describe, expect, it, vi } from 'vitest';

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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns exactly 8 reviews from the landing reviewer pool', () => {
    const reviews = pickLandingReviews(LANDING_REVIEWERS);

    expect(reviews).toHaveLength(8);
  });

  it('returns at most one review per person', () => {
    const reviews = pickLandingReviews(LANDING_REVIEWERS);

    const uniqueReviewerIds = new Set(reviews.map(review => review.id));

    expect(uniqueReviewerIds.size).toBe(reviews.length);
  });

  it("selects review text from that reviewer's three options", () => {
    const reviews = pickLandingReviews(LANDING_REVIEWERS);

    reviews.forEach(review => {
      const reviewer = LANDING_REVIEWERS.find(entry => entry.id === review.id);

      expect(reviewer).toBeDefined();
      expect(reviewer?.reviews).toContain(review.text);
    });
  });

  it('is deterministic when Math.random is seeded', () => {
    const seededValues = Array.from({ length: 30 }, (_, index) => (index + 1) / 31);
    const seededRandom = createSeededRandom(seededValues);

    vi.spyOn(Math, 'random').mockImplementation(seededRandom);

    const firstPass = pickLandingReviews(LANDING_REVIEWERS);

    vi.spyOn(Math, 'random').mockImplementation(createSeededRandom(seededValues));

    const secondPass = pickLandingReviews(LANDING_REVIEWERS);

    expect(secondPass).toEqual(firstPass);
  });

  it('throws when display count exceeds reviewer pool size', () => {
    const smallPool = LANDING_REVIEWERS.slice(0, 7);

    expect(() => pickLandingReviews(smallPool)).toThrow(/exceeds reviewer pool size/);
  });
});
