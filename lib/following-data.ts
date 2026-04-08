/**
 * Following feed data — Twitch followed channels (sectioned) + YouTube subscriptions.
 * Used by the FollowingFeed component on the home page Following tab.
 */

import type { ContentItem } from './content';
import { TIER_META, type TwitchTier } from './twitch-following';

export interface FollowingSection {
  id: string;
  label: string;
  platform: 'twitch' | 'youtube' | 'mixed';
  items: ContentItem[];
  totalCount?: number; // for sections with more channels than shown
}

// ── YouTube Subscriptions ──

const ytSubs: ContentItem[] = [
  { id: 'yt-sub-1', type: 'std', platform: 'youtube', title: 'I Spent 100 Hours in Minecraft Hardcore', author: 'MrBeast', subtitle: 'Can I survive 100 hours in the hardest difficulty?', extra: 'The most ambitious survival challenge yet. Custom mods, insane builds, and the threat of permadeath looming over every decision.', time: '3h', views: '18M', likes: '1.2M', comments: '84K', tags: ['entertainment', 'gaming'], videoId: 'dQw4w9WgXcQ' },
  { id: 'yt-sub-2', type: 'std', platform: 'youtube', title: 'Galaxy S26 Ultra — The Truth After 2 Weeks', author: 'MKBHD', subtitle: 'The most honest smartphone review on the internet.', extra: 'Marques breaks down camera quality, battery life, software experience, and whether the AI features actually matter in daily use.', time: '5h', views: '4.2M', likes: '280K', comments: '12K', tags: ['tech'], videoId: 'XkY2DOUCWMU' },
  { id: 'yt-sub-3', type: 'std', platform: 'youtube', title: 'The Paradox of Choice in Modern Gaming', author: 'Veritasium', subtitle: 'Why more options make us less happy.', extra: 'Derek explores the psychology of decision fatigue through the lens of gaming libraries, subscription services, and infinite content.', time: '6h', views: '3.8M', likes: '245K', comments: '18K', tags: ['science', 'gaming'], videoId: 'yWO-cvGETRQ' },
  { id: 'yt-sub-4', type: 'std', platform: 'youtube', title: 'I Built a Mass Spectrometer From Scratch', author: 'NileRed', subtitle: 'Chemistry meets engineering in the most ambitious build yet.', extra: 'Nile documents every step of building a working mass spectrometer from raw materials. The precision required is staggering.', time: '1h', views: '6.1M', likes: '420K', comments: '22K', tags: ['science'], isNew: true, videoId: 'fNk_zzaMoSs' },
  { id: 'yt-sub-5', type: 'std', platform: 'youtube', title: 'How I Made $0 With 1M Subscribers', author: 'Linus Tech Tips', subtitle: 'The economics of tech YouTube are broken.', extra: 'A brutally honest breakdown of ad revenue, sponsor deals, and why subscriber count means less than you think.', time: '8h', views: '2.9M', likes: '195K', comments: '8.4K', tags: ['tech', 'culture'], videoId: 'Tn6-PIqc4UM' },
  { id: 'yt-sub-6', type: 'std', platform: 'youtube', title: 'The Simplest Math Nobody Can Solve', author: '3Blue1Brown', subtitle: 'Collatz conjecture visualized in higher dimensions.', extra: 'Grant Sanderson presents the Collatz conjecture through stunning 3D visualizations that reveal hidden geometric structure in the problem.', time: '2h', views: '2.1M', likes: '168K', comments: '6.2K', tags: ['science', 'math'], isNew: true, videoId: 'jBmrduvKl64' },
];

// ── Twitch: Daily Watch ──

const dailyWatch: ContentItem[] = [
  { id: 'tw-dw-1', type: 'live', platform: 'twitch', title: 'Ranked Grind — Going for #1', author: 'Jynxzi', subtitle: 'Rainbow Six Siege ranked. 47K watching the climb.', extra: 'Jynxzi is in his element — cracked aim, chaotic comms, and a chat that never stops. Stream has been going 8 hours and the energy is somehow still rising.', viewers: '47K', views: '890K', likes: '62K', tags: ['gaming', 'entertainment'], isLive: true, channelId: 'jynxzi' },
  { id: 'tw-dw-2', type: 'live', platform: 'twitch', title: 'REACT ANDY — Watching Everything', author: 'xQc', subtitle: 'Reacting to the internet with 20K degens.', extra: 'The juice is loose. xQc is bouncing between YouTube videos, Reddit threads, and chat suggestions at lightspeed. Peak entertainment chaos.', viewers: '21K', views: '1.4M', likes: '95K', tags: ['entertainment', 'culture'], isLive: true, channelId: 'xqc' },
  { id: 'tw-dw-3', type: 'live', platform: 'twitch', title: 'Road to Rank 1 — Chat picks the drop', author: 'stableronaldo', subtitle: 'Fortnite ranked with the boys. Clips going viral.', extra: 'The energy is unmatched. Guest appearances from the squad throughout the stream. Every game is highlight-worthy.', viewers: '214K', views: '1.2M', likes: '89K', tags: ['gaming', 'entertainment'], isLive: true, channelId: 'stableronaldo' },
  { id: 'tw-dw-4', type: 'live', platform: 'twitch', title: 'Just Chatting w/ Chat', author: 'Lacy', subtitle: 'Vibes, stories, and unfiltered conversations.', viewers: '12K', views: '340K', likes: '28K', tags: ['entertainment', 'culture'], isLive: true, channelId: 'lacy' },
  { id: 'tw-dw-5', type: 'std', platform: 'twitch', title: 'Last stream: Elden Ring DLC No-Hit Run', author: 'Agent00', subtitle: 'Attempted one of the hardest challenges in gaming. VOD is wild.', time: '4h', views: '180K', likes: '14K', tags: ['gaming'], channelId: 'agent00' },
  { id: 'tw-dw-6', type: 'std', platform: 'twitch', title: 'Fortnite Zero Build Customs', author: 'Tfue', subtitle: 'Running customs with subs. No builds, pure aim.', time: '6h', views: '420K', likes: '32K', tags: ['gaming', 'entertainment'], channelId: 'tfue' },
  { id: 'tw-dw-7', type: 'std', platform: 'twitch', title: 'IRL Stream — Behind the Scenes', author: 'jasontheween', subtitle: 'Day in the life content. The real ones tuned in.', time: '8h', views: '95K', likes: '8.2K', tags: ['entertainment', 'culture'], channelId: 'jasontheween' },
  { id: 'tw-dw-8', type: 'std', platform: 'twitch', title: 'Late Night Chilling w/ Chat', author: 'mooda', subtitle: 'Just hanging. Music recs and deep convos.', time: '3h', views: '62K', likes: '5.4K', tags: ['entertainment', 'music'], channelId: 'mooda' },
  { id: 'tw-dw-9', type: 'live', platform: 'twitch', title: 'React Content + Gaming Later', author: 'zackrawrr', subtitle: 'The Zack show. Reacting first, gaming after.', viewers: '8.5K', views: '210K', likes: '16K', tags: ['entertainment', 'gaming'], isLive: true, channelId: 'zackrawrr' },
];

// ── Twitch: Large Active Creators ──

const largeCreators: ContentItem[] = [
  { id: 'tw-lac-1', type: 'live', platform: 'twitch', title: 'W STREAM — Big Announcements', author: 'AdinRoss', subtitle: 'Something huge is coming. Adin is cooking.', viewers: '85K', views: '2.1M', likes: '145K', tags: ['entertainment', 'culture'], isLive: true, channelId: 'adinross' },
  { id: 'tw-lac-2', type: 'live', platform: 'twitch', title: 'Return of the King — FPS Grind', author: 'shroud', subtitle: 'Playing everything at an inhuman level.', viewers: '28K', views: '680K', likes: '52K', tags: ['gaming'], isLive: true, channelId: 'shroud' },
  { id: 'tw-lac-3', type: 'std', platform: 'twitch', title: 'Reacting to the Worst Takes on the Internet', author: 'moistcr1tikal', subtitle: 'Charlie found the mother lode of bad takes.', time: '2h', views: '1.8M', likes: '120K', tags: ['entertainment', 'culture'], channelId: 'moistcr1tikal' },
  { id: 'tw-lac-4', type: 'std', platform: 'twitch', title: 'WoW Classic — Hardcore Ironman', author: 'Asmongold', subtitle: 'One death and it is all over. The stakes are real.', time: '5h', views: '920K', likes: '68K', tags: ['gaming'], channelId: 'asmongold' },
  { id: 'tw-lac-5', type: 'std', platform: 'twitch', title: 'Fortnite Ranked w/ Clix', author: 'Ninja', subtitle: 'The OG duo is back. Ranked grind.', time: '7h', views: '1.2M', likes: '82K', tags: ['gaming', 'entertainment'], channelId: 'ninja' },
  { id: 'tw-lac-6', type: 'std', platform: 'twitch', title: 'Late Night Valorant', author: 'yourragegaming', subtitle: 'YourRAGE on the ranked ladder. Chat roasting every whiff.', time: '3h', views: '340K', likes: '24K', tags: ['gaming', 'entertainment'], channelId: 'yourragegaming' },
];

// ── Twitch: Fortnite / Comp ──

const fortniteComp: ContentItem[] = [
  { id: 'tw-fn-1', type: 'live', platform: 'twitch', title: 'FNCS Grand Finals Practice', author: 'Clix', subtitle: 'Warming up for the biggest tournament of the year.', viewers: '32K', views: '780K', likes: '56K', tags: ['gaming', 'fortnite'], isLive: true, channelId: 'clix' },
  { id: 'tw-fn-2', type: 'live', platform: 'twitch', title: 'Arena Grind — Unreal Rank', author: 'Bugha', subtitle: 'World Cup champ still grinding. The mechanics are scary.', viewers: '18K', views: '420K', likes: '34K', tags: ['gaming', 'fortnite'], isLive: true, channelId: 'bugha' },
  { id: 'tw-fn-3', type: 'std', platform: 'twitch', title: 'How to Win Every Endgame', author: 'MrSavage', subtitle: 'Breaking down rotations and positioning for finals.', time: '4h', views: '560K', likes: '42K', tags: ['gaming', 'fortnite'], channelId: 'mrsavage' },
  { id: 'tw-fn-4', type: 'std', platform: 'twitch', title: 'Ranked Arena — Piece Control Practice', author: 'Peterbot', subtitle: 'The fastest editor in the game is warming up.', time: '2h', views: '280K', likes: '22K', tags: ['gaming', 'fortnite'], channelId: 'peterbot' },
  { id: 'tw-fn-5', type: 'std', platform: 'twitch', title: 'Duo Cash Cup w/ rezonfn', author: 'NateHill', subtitle: 'Competing for the bag. Commentary and callouts.', time: '6h', views: '180K', likes: '14K', tags: ['gaming', 'fortnite'], channelId: 'natehill' },
  { id: 'tw-fn-6', type: 'live', platform: 'twitch', title: 'EU Ranked — Top 10 Push', author: 'chapix', subtitle: 'One of the best EU players alive. Insane edits.', viewers: '6.2K', views: '140K', likes: '11K', tags: ['gaming', 'fortnite'], isLive: true, channelId: 'chapix' },
];

// ── Twitch: IRL / Just Chatting ──

const irlChatting: ContentItem[] = [
  { id: 'tw-irl-1', type: 'live', platform: 'twitch', title: 'IRL Adventure — Exploring the City', author: 'CatchaLuna', subtitle: 'Walking around downtown with a camera and good energy.', viewers: '4.8K', views: '120K', likes: '9.6K', tags: ['culture', 'entertainment'], isLive: true, channelId: 'catchaluna' },
  { id: 'tw-irl-2', type: 'live', platform: 'twitch', title: 'JUST CHATTING — Reacting to Chat', author: 'caseoh_', subtitle: 'CaseOh is in rare form today. Every reaction is gold.', viewers: '52K', views: '1.1M', likes: '78K', tags: ['entertainment', 'culture'], isLive: true, channelId: 'caseoh_' },
  { id: 'tw-irl-3', type: 'std', platform: 'twitch', title: 'Cooking Stream — Korean BBQ at Home', author: 'ExtraEmily', subtitle: 'Emily is making a full Korean BBQ spread. Chat is helping.', time: '3h', views: '280K', likes: '22K', tags: ['culture', 'entertainment'], channelId: 'extraemily' },
  { id: 'tw-irl-4', type: 'std', platform: 'twitch', title: 'DEO Night — Just Vibing', author: 'BruceDropEmOff', subtitle: 'Bruce with the community. Stories, reactions, and laughs.', time: '5h', views: '520K', likes: '38K', tags: ['entertainment', 'culture'], channelId: 'brucedropemoff' },
  { id: 'tw-irl-5', type: 'std', platform: 'twitch', title: 'Late Night Talks', author: 'LosPollosTV', subtitle: 'Real conversations about life, streaming, and the culture.', time: '8h', views: '160K', likes: '12K', tags: ['entertainment', 'culture'], channelId: 'lospollos' },
];

// ── Twitch: Music / Variety ──

const musicVariety: ContentItem[] = [
  { id: 'tw-mus-1', type: 'live', platform: 'twitch', title: 'Making Beats LIVE — Producing Heat', author: 'Timbaland', subtitle: 'Legendary producer making beats from scratch on stream.', viewers: '8.4K', views: '340K', likes: '28K', tags: ['music', 'entertainment'], isLive: true, channelId: 'timbaland' },
  { id: 'tw-mus-2', type: 'live', platform: 'twitch', title: 'Drum Covers — Taking Requests', author: 'officedrummer', subtitle: 'The most energetic drummer on Twitch. Chat picks the songs.', viewers: '3.2K', views: '92K', likes: '7.8K', tags: ['music', 'entertainment'], isLive: true, channelId: 'officedrummer' },
  { id: 'tw-mus-3', type: 'std', platform: 'twitch', title: 'Acoustic Session — New Unreleased Songs', author: 'PostMalone', subtitle: 'Posty playing unreleased tracks on guitar. Intimate vibes.', time: '1h', views: '2.8M', likes: '210K', tags: ['music'], channelId: 'postmalone' },
  { id: 'tw-mus-4', type: 'std', platform: 'twitch', title: 'Beat Battle — Chat Votes the Winner', author: 'logic', subtitle: 'Logic vs. chat producers. The bars are flowing.', time: '4h', views: '680K', likes: '48K', tags: ['music', 'entertainment'], channelId: 'logic' },
  { id: 'tw-mus-5', type: 'std', platform: 'twitch', title: 'Guitar Improv — Jazz Fusion Session', author: 'fernandosouzaguitar', subtitle: 'Unreal guitar skills. Every note is intentional.', time: '6h', views: '45K', likes: '3.8K', tags: ['music'], channelId: 'fernandosouzaguitar' },
];

// ── Twitch: Souls / Elden Ring ──

const soulsEldenRing: ContentItem[] = [
  { id: 'tw-souls-1', type: 'live', platform: 'twitch', title: 'Elden Ring DLC — Any% Speedrun WR Attempts', author: 'Distortion2', subtitle: 'Going for the world record. Every second counts.', viewers: '6.8K', views: '180K', likes: '14K', tags: ['gaming'], isLive: true, channelId: 'distortion2' },
  { id: 'tw-souls-2', type: 'std', platform: 'twitch', title: 'Dark Souls 3 — Both Hands Challenge Run', author: 'MissMikkaa', subtitle: 'Playing with two controllers simultaneously. It should not be possible.', time: '3h', views: '420K', likes: '34K', tags: ['gaming'], channelId: 'missmikkaa' },
  { id: 'tw-souls-3', type: 'std', platform: 'twitch', title: 'Bloodborne — BL4 All Bosses', author: 'Asmongold247', subtitle: 'Base level run through every boss. Pure masochism.', time: '7h', views: '95K', likes: '7.2K', tags: ['gaming'], channelId: 'asmongold247' },
  { id: 'tw-souls-4', type: 'std', platform: 'twitch', title: 'Elden Ring Lore Deep Dive', author: 'NakeyJakey', subtitle: 'Breaking down the story threads nobody is talking about.', time: '5h', views: '210K', likes: '18K', tags: ['gaming', 'culture'], channelId: 'nakeyjakey' },
];

// ── Build sections ──

const SECTION_MAP: { tier: TwitchTier; items: ContentItem[] }[] = [
  { tier: 'daily_watch', items: dailyWatch },
  { tier: 'large_active_creators', items: largeCreators },
  { tier: 'fortnite_comp', items: fortniteComp },
  { tier: 'irl_chatting', items: irlChatting },
  { tier: 'music_priority', items: musicVariety },
  { tier: 'souls_priority', items: soulsEldenRing },
];

export function getFollowingSections(): FollowingSection[] {
  const sections: FollowingSection[] = [];

  // YouTube Subscriptions first
  sections.push({
    id: 'yt-subs',
    label: 'YouTube Subscriptions',
    platform: 'youtube',
    items: ytSubs,
  });

  // Twitch sections by tier
  for (const { tier, items } of SECTION_MAP) {
    const meta = TIER_META.find((t) => t.id === tier);
    if (!meta) continue;
    sections.push({
      id: `tw-${tier}`,
      label: meta.label,
      platform: 'twitch',
      items,
      totalCount: meta.count,
    });
  }

  return sections;
}

/** Flat array of all following content for harness compatibility */
export function getAllFollowingItems(): ContentItem[] {
  return [...ytSubs, ...dailyWatch, ...largeCreators, ...fortniteComp, ...irlChatting, ...musicVariety, ...soulsEldenRing];
}
