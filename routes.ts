/**
 * An array of routes that are accessible to the public
 */
export const publicRoutes = [''];

/**
 * An array of routes that are used for authentication
 * @type {string[]}
 */
export const authRoutes = ["/auth/sign-in", "/auth/sign-up"];

/**
 * The prefix for API authentication routes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/";
