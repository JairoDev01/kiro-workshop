/**
 * Express middleware for the local backend.
 *
 * AUTH REMOVED: there is no Cognito/JWT validation anymore. `injectDevUser`
 * attaches a fixed demo identity to every request so handlers that are
 * owner-scoped (now or later) can still read `req.user` without any real
 * authentication. Swap this back for a real guard if auth is reintroduced.
 */
import type { NextFunction, Request, Response } from 'express';

export interface DevUser {
  userId: string;
  email: string;
}

/** The fixed local identity, mirroring the frontend's mock user. */
export const DEV_USER: DevUser = {
  userId: 'local-dev-user',
  email: 'demo@local.dev',
};

/** A request carries the (demo) user resolved by `injectDevUser`. */
export interface AuthedRequest extends Request {
  user?: DevUser;
}

/** Attach the demo user to every request. No token, no validation. */
export function injectDevUser() {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    req.user = DEV_USER;
    next();
  };
}
