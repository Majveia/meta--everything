/**
 * Validates and reports on API environment variable configuration at startup.
 * All vars are optional — missing means the platform falls back to mock data.
 * Present but malformed vars get a clear warning so misconfiguration is caught early.
 */

interface EnvReport {
  youtube: boolean;
  twitch: boolean;
  x: boolean;
  substack: boolean;
  kick: boolean;
  warnings: string[];
}

function notEmpty(v: string | undefined): boolean {
  return typeof v === 'string' && v.trim().length > 0;
}

function warn(msg: string, warnings: string[]) {
  warnings.push(msg);
  console.warn(`[env] ${msg}`);
}

let cached: EnvReport | null = null;

export function validateEnv(): EnvReport {
  if (cached) return cached;

  const warnings: string[] = [];

  // YouTube
  const ytKey = process.env.YOUTUBE_API_KEY;
  const youtubeOk = notEmpty(ytKey);
  if (notEmpty(ytKey) && ytKey!.length < 20) {
    warn('YOUTUBE_API_KEY looks too short — expected a 39-char API key', warnings);
  }

  // Twitch — needs both CLIENT_ID and ACCESS_TOKEN
  const twClientId = process.env.TWITCH_CLIENT_ID;
  const twToken = process.env.TWITCH_ACCESS_TOKEN;
  const twitchOk = notEmpty(twClientId) && notEmpty(twToken);
  if (notEmpty(twClientId) && !notEmpty(twToken)) {
    warn('TWITCH_CLIENT_ID set but TWITCH_ACCESS_TOKEN is missing', warnings);
  }
  if (!notEmpty(twClientId) && notEmpty(twToken)) {
    warn('TWITCH_ACCESS_TOKEN set but TWITCH_CLIENT_ID is missing', warnings);
  }

  // X / Twitter
  const xToken = process.env.X_API_BEARER_TOKEN;
  const xAccounts = process.env.X_ACCOUNTS;
  const xOk = notEmpty(xToken) && notEmpty(xAccounts);
  if (notEmpty(xToken) && !notEmpty(xAccounts)) {
    warn('X_API_BEARER_TOKEN set but X_ACCOUNTS is missing (comma-separated usernames required)', warnings);
  }

  // Substack
  const substackPubs = process.env.SUBSTACK_PUBLICATIONS;
  const substackOk = notEmpty(substackPubs);
  if (notEmpty(substackPubs)) {
    const slugs = substackPubs!.split(',').map((s) => s.trim()).filter(Boolean);
    if (slugs.length === 0) {
      warn('SUBSTACK_PUBLICATIONS is set but contains no valid slugs', warnings);
    }
  }

  // Kick
  const kickChannels = process.env.KICK_CHANNELS;
  const kickOk = notEmpty(kickChannels);

  cached = { youtube: youtubeOk, twitch: twitchOk, x: xOk, substack: substackOk, kick: kickOk, warnings };
  return cached;
}

/** Reset cache (for testing) */
export function _resetEnvCache() { cached = null; }
