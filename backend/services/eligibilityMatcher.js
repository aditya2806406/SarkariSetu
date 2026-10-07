/**
 * eligibilityMatcher — the actual rule engine behind POST
 * /api/eligibility/check. Deliberately a pure function: given a profile
 * and a list of schemes, it returns the subset that match, with no
 * database or network calls inside it. That's what makes it fully
 * unit-testable without mocking Mongo or any API.
 *
 * Matching philosophy: a scheme matches if the profile does not
 * contradict any of its stated eligibility rules. An unset rule (null,
 * empty array, or an unset flag) is treated as "no restriction" rather
 * than "excludes everyone" — e.g. eligibility.states: [] means
 * all-India, not "no state qualifies."
 */

/**
 * matchesAge — true if the profile's age falls within [minAge, maxAge].
 * Either bound may be null/undefined, meaning "no limit" on that side.
 * If the profile didn't supply an age at all, age is never used to
 * exclude a scheme (we don't penalize incomplete profiles).
 */
function matchesAge(profileAge, eligibility) {
  if (profileAge === null || profileAge === undefined || profileAge === "") return true;
  const age = Number(profileAge);
  if (Number.isNaN(age)) return true;

  if (eligibility.minAge != null && age < eligibility.minAge) return false;
  if (eligibility.maxAge != null && age > eligibility.maxAge) return false;
  return true;
}

/**
 * matchesIncome — true if the profile's annual income is at or below
 * the scheme's maxAnnualIncome cap. A null/undefined cap means no
 * income restriction (the scheme isn't income-tested).
 */
function matchesIncome(profileIncome, eligibility) {
  if (eligibility.maxAnnualIncome == null) return true;
  if (profileIncome === null || profileIncome === undefined || profileIncome === "") return true;

  const income = Number(profileIncome);
  if (Number.isNaN(income)) return true;

  return income <= eligibility.maxAnnualIncome;
}

/**
 * matchesCategory — true if the scheme has no category restriction, or
 * the profile's category is in the scheme's allowed list.
 */
function matchesCategory(profileCategory, eligibility) {
  if (!eligibility.categories || eligibility.categories.length === 0) return true;
  if (!profileCategory) return true;
  return eligibility.categories.includes(profileCategory);
}

/**
 * matchesState — true if the scheme is all-India (empty states array),
 * or the profile's state is in the scheme's list.
 */
function matchesState(profileState, eligibility) {
  if (!eligibility.states || eligibility.states.length === 0) return true;
  if (!profileState) return true;
  return eligibility.states.includes(profileState);
}

/**
 * matchesFlags — every flag the scheme requires (requiresFarmer,
 * requiresWoman, etc.) must be true on the profile. Flags the scheme
 * doesn't require are ignored entirely — a scheme with no flags set
 * excludes nobody on this basis.
 */
function matchesFlags(profile, eligibility) {
  const flags = eligibility.flags || {};
  const flagToProfileKey = {
    requiresStudent: "isStudent",
    requiresFarmer: "isFarmer",
    requiresWoman: "isWoman",
    requiresSeniorCitizen: "isSeniorCitizen",
    requiresDivyang: "isDivyang",
  };

  return Object.entries(flagToProfileKey).every(([flagKey, profileKey]) => {
    if (!flags[flagKey]) return true; // scheme doesn't require this — no restriction
    return !!profile[profileKey];
  });
}

/**
 * matchesGender — true if the scheme is open to any gender, or the
 * profile's stated gender matches.
 */
function matchesGender(profileGender, eligibility) {
  if (!eligibility.gender || eligibility.gender === "any") return true;
  if (!profileGender) return true;
  return eligibility.gender === profileGender;
}

/**
 * schemeMatchesProfile — true only if every individual rule passes.
 * Exported on its own so a single scheme/profile pair can be tested
 * directly, in addition to testing the batch matcher below.
 */
export function schemeMatchesProfile(scheme, profile) {
  const eligibility = scheme.eligibility || {};
  return (
    matchesAge(profile.age, eligibility) &&
    matchesIncome(profile.annualIncome, eligibility) &&
    matchesCategory(profile.category, eligibility) &&
    matchesState(profile.state, eligibility) &&
    matchesGender(profile.gender, eligibility) &&
    matchesFlags(profile, eligibility)
  );
}

/**
 * matchEligibleSchemes — the function POST /api/eligibility/check
 * actually calls. Filters the full active scheme list down to the ones
 * that match, and sorts them by how specifically they match the profile
 * (more restrictive rules = higher specificity score).
 */
export function matchEligibleSchemes(schemes, profile) {
  const matched = schemes.filter((scheme) => schemeMatchesProfile(scheme, profile));

  return matched.sort((a, b) => {
    const getScore = (elig) => {
      let score = 0;
      if (!elig) return 0;
      if (elig.minAge != null || elig.maxAge != null) score += 1;
      if (elig.gender && elig.gender !== "any") score += 2;
      if (elig.categories && elig.categories.length > 0) score += 2;
      if (elig.maxAnnualIncome != null) score += 2;
      if (elig.states && elig.states.length > 0) score += 1;
      if (elig.flags) {
        score += Object.values(elig.flags).filter(Boolean).length * 2;
      }
      return score;
    };

    const scoreA = getScore(a.eligibility);
    const scoreB = getScore(b.eligibility);

    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Descending order of specificity
    }

    // Fallback to featured status, then alphabetically
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });
}
