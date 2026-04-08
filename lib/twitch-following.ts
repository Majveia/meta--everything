/**
 * Twitch followed channels — 366 unique channels organized by priority tier.
 * Source: page-html scrape of https://www.twitch.tv/directory/following/channels
 * Tier assignments from twitch_app_sections_handoff.
 */

export interface TwitchChannel {
  slug: string;
  displayName: string;
  priorityTier: TwitchTier;
  contentCluster: string;
  activityScore?: number;
  rankingConfidence?: 'full' | 'partial' | 'none';
  avgViewers?: number;
}

export type TwitchTier =
  | 'daily_watch'
  | 'large_active_creators'
  | 'fortnite_comp'
  | 'irl_chatting'
  | 'music_priority'
  | 'souls_priority'
  | 'explore';

export interface TierMeta {
  id: TwitchTier;
  label: string;
  filterChip: string;
  count: number;
}

export const TIER_META: TierMeta[] = [
  { id: 'daily_watch', label: 'Daily Watch', filterChip: 'Daily', count: 13 },
  { id: 'large_active_creators', label: 'Large Creators', filterChip: 'Popular', count: 14 },
  { id: 'fortnite_comp', label: 'Fortnite / Comp', filterChip: 'Fortnite', count: 49 },
  { id: 'irl_chatting', label: 'IRL / Just Chatting', filterChip: 'IRL', count: 14 },
  { id: 'music_priority', label: 'Music / Variety', filterChip: 'Music', count: 20 },
  { id: 'souls_priority', label: 'Souls / Elden Ring', filterChip: 'Souls', count: 4 },
  { id: 'explore', label: 'Explore', filterChip: 'Explore', count: 252 },
];

export const twitchFollowing: TwitchChannel[] = [
  // ── Daily Watch (13) ──
  { slug: 'jasontheween', displayName: 'jasontheween', priorityTier: 'daily_watch', contentCluster: 'variety' },
  { slug: 'primatepaige', displayName: 'PrimatePaige', priorityTier: 'daily_watch', contentCluster: 'variety' },
  { slug: 'jynxzi', displayName: 'Jynxzi', priorityTier: 'daily_watch', contentCluster: 'variety', activityScore: 0.9834, rankingConfidence: 'full', avgViewers: 46893 },
  { slug: 'marlon', displayName: 'Marlon', priorityTier: 'daily_watch', contentCluster: 'variety' },
  { slug: 'lacy', displayName: 'Lacy', priorityTier: 'daily_watch', contentCluster: 'variety' },
  { slug: 'cinna', displayName: 'Cinna', priorityTier: 'daily_watch', contentCluster: 'variety' },
  { slug: 'mooda', displayName: 'mooda', priorityTier: 'daily_watch', contentCluster: 'variety' },
  { slug: 'higgs', displayName: 'Higgs', priorityTier: 'daily_watch', contentCluster: 'variety' },
  { slug: 'xqc', displayName: 'xQc', priorityTier: 'daily_watch', contentCluster: 'variety', activityScore: 0.9, rankingConfidence: 'full', avgViewers: 19367 },
  { slug: 'stableronaldo', displayName: 'stableronaldo', priorityTier: 'daily_watch', contentCluster: 'variety', rankingConfidence: 'partial' },
  { slug: 'zackrawrr', displayName: 'zackrawrr', priorityTier: 'daily_watch', contentCluster: 'variety' },
  { slug: 'agent00', displayName: 'Agent00', priorityTier: 'daily_watch', contentCluster: 'variety' },
  { slug: 'tfue', displayName: 'Tfue', priorityTier: 'daily_watch', contentCluster: 'fortnite_comp' },

  // ── Large Active Creators (14) ──
  { slug: 'ninja', displayName: 'Ninja', priorityTier: 'large_active_creators', contentCluster: 'variety' },
  { slug: 'adinross', displayName: 'AdinRoss', priorityTier: 'large_active_creators', contentCluster: 'variety' },
  { slug: 'fightincowboy', displayName: 'FightinCowboy', priorityTier: 'large_active_creators', contentCluster: 'souls_action_rpg' },
  { slug: 'moistcr1tikal', displayName: 'moistcr1tikal', priorityTier: 'large_active_creators', contentCluster: 'variety' },
  { slug: 'shroud', displayName: 'shroud', priorityTier: 'large_active_creators', contentCluster: 'fps_cod' },
  { slug: 'fanum', displayName: 'Fanum', priorityTier: 'large_active_creators', contentCluster: 'variety' },
  { slug: 'nickmercs', displayName: 'NICKMERCS', priorityTier: 'large_active_creators', contentCluster: 'fps_cod' },
  { slug: 'cohhcarnage', displayName: 'CohhCarnage', priorityTier: 'large_active_creators', contentCluster: 'variety' },
  { slug: 'peterbot', displayName: 'Peterbot', priorityTier: 'large_active_creators', contentCluster: 'fortnite_comp' },
  { slug: 'asmongold', displayName: 'Asmongold', priorityTier: 'large_active_creators', contentCluster: 'variety' },
  { slug: 'yourragegaming', displayName: 'yourragegaming', priorityTier: 'large_active_creators', contentCluster: 'variety' },
  { slug: 'trainwreckstv', displayName: 'Trainwreckstv', priorityTier: 'large_active_creators', contentCluster: 'variety' },
  { slug: 'clix', displayName: 'Clix', priorityTier: 'large_active_creators', contentCluster: 'fortnite_comp' },
  { slug: 'bugha', displayName: 'Bugha', priorityTier: 'large_active_creators', contentCluster: 'fortnite_comp' },

  // ── Fortnite / Comp (49 — top 20 named) ──
  { slug: 'natehill', displayName: 'NateHill', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'th0mashd', displayName: 'Th0masHD', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'rezonfn', displayName: 'rezonfn', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'youwy', displayName: 'Youwy', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'pollofn6', displayName: 'pollofn6', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'mrsavage', displayName: 'MrSavage', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'ajerss', displayName: 'Ajerss', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'zscaryyy', displayName: 'zScaryyy', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'merstaach', displayName: 'Merstaach', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'malibuca', displayName: 'Malibuca', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'pxlarized', displayName: 'Pxlarized', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'risezd', displayName: 'Risezd', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'coldfv', displayName: 'coldfv', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'venofn', displayName: 'venofn', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'risefn', displayName: 'risefn', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'pinqeu', displayName: 'pinqeu', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'dukezfn', displayName: 'DukezFN', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'degenfn', displayName: 'DegenFN', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'chapix', displayName: 'chapix', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },
  { slug: 'queasy', displayName: 'queasy', priorityTier: 'fortnite_comp', contentCluster: 'fortnite_comp' },

  // ── IRL / Just Chatting (14) ──
  { slug: 'imallisonkroes', displayName: 'imallisonkroes', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'extraemily', displayName: 'ExtraEmily', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'fanfan', displayName: 'fanfan', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'catchaluna', displayName: 'CatchaLuna', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'riceandginger', displayName: 'riceandginger', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'outtacontrolnicole', displayName: 'outtacontrolnicole', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'plumchuu', displayName: 'plumchuu', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'daddyp', displayName: 'DaddyP', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'caseoh_', displayName: 'caseoh_', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'druski', displayName: 'druski', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'brucedropemoff', displayName: 'BruceDropEmOff', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'duke', displayName: 'Duke', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'fazebanks', displayName: 'FaZeBanks', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },
  { slug: 'lospollos', displayName: 'LosPollosTV', priorityTier: 'irl_chatting', contentCluster: 'irl_just_chatting' },

  // ── Music / Variety (20) ──
  { slug: 'justinbieber', displayName: 'JustinBieber', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'fernandosouzaguitar', displayName: 'fernandosouzaguitar', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'eyeshaofficial', displayName: 'EYESHAofficial', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'officedrummer', displayName: 'officedrummer', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'donaldtrump', displayName: 'DonaldTrump', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'rollingstone', displayName: 'RollingStone', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'timbaland', displayName: 'Timbaland', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'raesantosmusic', displayName: 'RaeSantosMusic', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'postmalone', displayName: 'PostMalone', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'musiciscode', displayName: 'musiciscode', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'amorosoviolin', displayName: 'amorosoviolin', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'nardwuarserviette', displayName: 'nardwuarserviette', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'thesongery', displayName: 'TheSongery', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'southeymusic', displayName: 'southeymusic', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'nathancavaleri', displayName: 'NathanCavaleri', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'newbaroque', displayName: 'newbaroque', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'souljaboy', displayName: 'souljaboy', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'parallelbeats', displayName: 'parallelbeats', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'logic', displayName: 'logic', priorityTier: 'music_priority', contentCluster: 'music_variety' },
  { slug: 'fmoneybeats', displayName: 'fmoneybeats', priorityTier: 'music_priority', contentCluster: 'music_variety' },

  // ── Souls / Elden Ring (4) ──
  { slug: 'distortion2', displayName: 'Distortion2', priorityTier: 'souls_priority', contentCluster: 'souls_action_rpg' },
  { slug: 'asmongold247', displayName: 'Asmongold247', priorityTier: 'souls_priority', contentCluster: 'souls_action_rpg' },
  { slug: 'missmikkaa', displayName: 'MissMikkaa', priorityTier: 'souls_priority', contentCluster: 'souls_action_rpg' },
  { slug: 'nakeyjakey', displayName: 'NakeyJakey', priorityTier: 'souls_priority', contentCluster: 'souls_action_rpg' },

  // ── Explore (top 20 named of 252) ──
  { slug: 'tennp0', displayName: 'Tennp0', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'rockoutli', displayName: 'RockOutLI', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'mari', displayName: 'MARI', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'notdianalim', displayName: 'notdianalim', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'bluesclues124', displayName: 'bluesclues124', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'poudiistreams', displayName: 'PoudiiStreams', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'madi2hottyy', displayName: 'Madi2hottyy', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'itsryanhiga', displayName: 'itsRyanHiga', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'edwn', displayName: 'edwn', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'markusking', displayName: 'MarkusKing', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'theburntpeanut', displayName: 'TheBurntPeanut', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'its_mirka', displayName: 'its_mirka', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'tiktok_shadow_tv', displayName: 'tiktok_shadow_tv', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'ducksaint', displayName: 'DuckSaint', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'swaggy3g', displayName: 'swaggy3g', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'thesketchreal', displayName: 'thesketchreal', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'justinbot1x', displayName: 'justinbot1x', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'btbdezzz', displayName: 'BtbDezzz', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: '3xpunga', displayName: '3xpunga', priorityTier: 'explore', contentCluster: 'variety' },
  { slug: 'bendadonnn', displayName: 'bendadonnn', priorityTier: 'explore', contentCluster: 'variety' },
];

/** Get channels by tier */
export function channelsByTier(tier: TwitchTier): TwitchChannel[] {
  return twitchFollowing.filter((c) => c.priorityTier === tier);
}
