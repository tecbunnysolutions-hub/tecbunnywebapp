// src/lib/errorMapper.ts

/**
 * Human Error Mapping Dictionary
 * Intercepts raw backend HTTP status codes and translates them into sweet,
 * comforting, and encouraging microcopy for a frictionless user experience.
 */
export const mapHumanError = (status: number): string => {
  switch (status) {
    case 401: 
      return "It looks like your session expired. Let's securely log you back in.";
    case 409: 
      return "Oops, it seems someone just grabbed this time slot! Let's find another perfect time for you.";
    case 422: 
      return "We couldn't quite read some of the details provided. Mind double-checking them?";
    case 429: 
      return "Wow, you're moving fast! Take a deep breath and try again in a few seconds.";
    case 503:
    case 504: 
      return "Our servers are taking a little breather. We're automatically retrying your request...";
    default: 
      return "Something unexpected happened, but don't worry—your data is safe. Please try again.";
  }
};
