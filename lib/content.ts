export interface ContentItem {
  id: string;
  type: 'live' | 'std' | 'compact';
  platform: 'twitch' | 'youtube' | 'x' | 'substack' | 'kick';
  title: string;
  subtitle: string;
  extra?: string;
  author: string;
  time?: string;
  viewers?: string;
  views?: string;
  likes?: string;
  comments?: string;
  tags: string[];
  isLive?: boolean;
  isNew?: boolean;
  delay?: number;
  videoId?: string;
  channelId?: string;
  signalBadge?: { label: string; type: 'affinity' | 'trending' | 'fresh' | 'serendipity' };
}

export interface Notification {
  id: string;
  icon: string;
  text: string;
  app: string;
  time: string;
  accent: string;
  read: boolean;
}

export const allContent: ContentItem[] = [
  // === For You feed ===
  { id: '0', type: 'live', platform: 'twitch', title: 'Stable Ronaldo \u2014 Road to Rank 1', author: 'Stable Ronaldo', subtitle: 'Grinding ranked with the boys. Chat picks the drop.', extra: 'The energy is unmatched. Clips are already going viral. Guest appearances from the squad throughout the stream.', viewers: '214K', views: '1.2M', likes: '89K', tags: ['gaming', 'entertainment'], delay: 80, channelId: 'stableronaldo' },
  { id: '1', type: 'std', platform: 'youtube', title: 'Visualizing Higher Dimensions', author: '3Blue1Brown', subtitle: 'Projecting 4D objects into perceivable space.', extra: 'Grant Sanderson walks through dimensional projection with his signature visual clarity \u2014 tesseracts, hyperspheres, and geometric intuitions.', time: '2h', views: '840K', likes: '62K', tags: ['science', 'math'], isNew: true, delay: 140, videoId: 'XkY2DOUCWMU' },
  { id: '2', type: 'compact', platform: 'x', title: 'On Recursive Self-Improvement', author: 'Andrej Karpathy', subtitle: '\u201CThe compound AI system is inevitable. Every generation ships with scaffolding that makes the next generation better.\u201D', extra: 'The thread continues with examples from software engineering \u2014 compilers that compile themselves, tests that test the testing framework.', time: '38m', views: '420K', likes: '18K', comments: '2.1K', tags: ['ai', 'tech'], isNew: true, delay: 200 },
  { id: '3', type: 'std', platform: 'substack', title: 'The Physics of Intelligence', author: 'Dwarkesh Patel', subtitle: 'Thermodynamic limits of computation.', extra: "A deep interview exploring whether intelligence has fundamental physical constraints. Touches on Landauer's principle and reversible computing.", time: '4h', views: '95K', likes: '4.2K', tags: ['science', 'ai', 'philosophy'], delay: 260 },
  { id: '4', type: 'compact', platform: 'x', title: 'Your thread is gaining traction', author: 'You', subtitle: '47 likes, 12 reposts on meta-recursive design systems.', time: '3h', views: '1.8K', likes: '47', comments: '8', tags: ['meta', 'tech'], delay: 320 },
  { id: '5', type: 'live', platform: 'kick', title: 'Late Night Code Session', author: 'CodeWithFire', subtitle: 'Building a recursive engine live.', viewers: '1.2K', views: '8.4K', likes: '620', tags: ['coding', 'gaming'], delay: 380, channelId: 'codewithfire' },
  { id: '6', type: 'std', platform: 'youtube', title: '10 Things I Hate About Every Framework', author: 'Fireship', subtitle: 'Honest takes on React, Svelte, Vue, and HTMX.', extra: "Jeff Delaney's trademark style stretched to 12 minutes. Each framework gets praised and roasted in equal measure.", time: '6h', views: '1.8M', likes: '112K', comments: '8.7K', tags: ['tech', 'coding'], delay: 440, videoId: 'Tn6-PIqc4UM' },
  { id: '16', type: 'std', platform: 'youtube', title: 'The Art of UI Sound Design', author: 'Noodl', subtitle: 'How Stripe, Linear, and Apple make interactions feel alive.', extra: 'Breakdown of frequency ranges, envelope curves, and the psychology of audio confirmation. Includes recreations in Web Audio API.', time: '3h', views: '420K', likes: '34K', comments: '2.8K', tags: ['design', 'tech'], delay: 500, videoId: 'jBmrduvKl64' },
  { id: '17', type: 'compact', platform: 'x', title: 'Design is how it works', author: 'Sahil Lavingia', subtitle: '\u201CThe best products feel like they were designed by one person. Coherence > features.\u201D', time: '1h', views: '89K', likes: '6.2K', comments: '340', tags: ['design', 'startups'], isNew: true, delay: 560 },
  { id: '18', type: 'live', platform: 'kick', title: 'Competitive Valorant Ranked Grind', author: 'TenZ', subtitle: 'Road to Radiant. Chat picks agents.', viewers: '42K', views: '180K', likes: '12K', tags: ['gaming', 'entertainment'], delay: 620, channelId: 'tenz' },
  { id: '19', type: 'std', platform: 'substack', title: 'The Economics of Attention', author: 'Matt Levine', subtitle: 'Why your feed is the most contested real estate on earth.', extra: 'A financial lens on the attention economy. CPMs, engagement curves, and the arbitrage between platforms.', time: '7h', views: '210K', likes: '18K', tags: ['economics', 'culture'], delay: 680 },

  // === Following feed ===
  { id: '7', type: 'live', platform: 'twitch', title: 'Vim + Rust Speedrun', author: 'ThePrimeagen', subtitle: 'Rewriting a JS tool in Rust with Vim motions.', viewers: '18K', views: '62K', likes: '4.1K', tags: ['coding', 'gaming'], delay: 80, channelId: 'theprimeagen' },
  { id: '8', type: 'std', platform: 'youtube', title: 'The Black Hole Information Paradox', author: 'Veritasium', subtitle: 'Where does information go past the horizon?', extra: "Derek Muller traces the paradox from Hawking's original paper through the Page curve resolution. Animations by the Kurzgesagt team.", time: '1h', views: '2.1M', likes: '145K', comments: '12K', tags: ['science', 'physics'], delay: 140, videoId: 'yWO-cvGETRQ' },
  { id: '9', type: 'compact', platform: 'x', title: 'Reply to your thread', author: '@deepmind_fan', subtitle: '\u201CThe meta-loop isn\'t a feature, it\'s a philosophy.\u201D', time: '2h', views: '340', likes: '12', tags: ['ai', 'meta'], delay: 200 },
  { id: '10', type: 'std', platform: 'substack', title: 'The Art of Shipping', author: 'Lenny Rachitsky', subtitle: 'Balancing speed with craft.', time: '5h', views: '78K', likes: '3.8K', tags: ['startups', 'tech'], delay: 260 },
  { id: '11', type: 'std', platform: 'youtube', title: 'Writing an OS from Scratch', author: 'Tsoding', subtitle: 'Raw assembly and C. Episode 23.', time: '8h', views: '340K', likes: '28K', comments: '3.2K', tags: ['coding', 'tech'], delay: 320, videoId: 'gfmRrPjnEw4' },
  { id: '12', type: 'compact', platform: 'substack', title: 'The AI Value Chain', author: 'Ben Thompson', subtitle: 'Where value accrues in the stack.', time: '12h', views: '120K', likes: '8.4K', tags: ['ai', 'startups'], delay: 380 },
  { id: '20', type: 'std', platform: 'youtube', title: 'Every Noise at Once', author: 'Vox', subtitle: 'Mapping the entire universe of music genres algorithmically.', extra: 'An exploration of the Every Noise project and how Spotify categorizes 6,000+ genres using audio analysis and listener behavior.', time: '4h', views: '1.4M', likes: '92K', comments: '5.6K', tags: ['music', 'culture'], delay: 440, videoId: 'lKrGCBME7Vg' },
  { id: '21', type: 'compact', platform: 'x', title: 'On taste in engineering', author: 'Guillermo Rauch', subtitle: '\u201CTaste is the ability to say no to good ideas. Ship less, but ship right.\u201D', time: '5h', views: '67K', likes: '4.8K', comments: '210', tags: ['tech', 'design'], delay: 500 },
  { id: '22', type: 'live', platform: 'twitch', title: 'Art Stream \u2014 Digital Painting', author: 'RossDraws', subtitle: 'Character design from sketch to render.', viewers: '8.4K', views: '34K', likes: '2.8K', tags: ['design', 'entertainment'], delay: 560, channelId: 'rossdraws' },
  { id: '23', type: 'std', platform: 'substack', title: 'The Case for Slowing Down', author: 'Molly White', subtitle: 'Why moving fast and breaking things broke trust.', extra: 'A thoughtful essay on the cultural cost of velocity-obsessed development. Cites healthcare.gov, Boeing, and crypto collapses.', time: '6h', views: '145K', likes: '11K', tags: ['culture', 'tech'], delay: 620 },

  // === For You — Twitch Browse (popular/trending, not followed) ===
  { id: '32', type: 'live', platform: 'twitch', title: 'Minecraft Hardcore 100 Days Challenge', author: 'Kaicenat', subtitle: 'Day 47 and still alive. 180K watching the madness.', viewers: '182K', views: '3.2M', likes: '245K', tags: ['gaming', 'entertainment'], isLive: true, delay: 80, channelId: 'kaicenat' },
  { id: '33', type: 'live', platform: 'twitch', title: 'Pro Valorant Ranked \u2014 Radiant Lobby', author: 'tarik', subtitle: 'Former CS pro destroying Valorant ranked. Content machine.', viewers: '42K', views: '680K', likes: '48K', tags: ['gaming', 'entertainment'], isLive: true, delay: 140, channelId: 'tarik' },
  { id: '34', type: 'live', platform: 'twitch', title: 'Just Chatting \u2014 Hot Takes Only', author: 'HasanAbi', subtitle: 'Hasan reacting to the wildest clips on the internet.', viewers: '38K', views: '920K', likes: '62K', tags: ['entertainment', 'culture'], isLive: true, delay: 200, channelId: 'hasanabi' },
  { id: '35', type: 'std', platform: 'twitch', title: 'Speedrunning Mario 64 \u2014 Sub 15 Attempts', author: 'Cheese', subtitle: 'World record pace. Every star counts.', time: '2h', views: '340K', likes: '28K', tags: ['gaming'], delay: 260, channelId: 'cheese' },

  // === For You — X / Twitter browse ===
  { id: '36', type: 'compact', platform: 'x', title: 'The algorithm is the product now', author: 'Balaji Srinivasan', subtitle: '\u201CEvery app is becoming a feed. Every feed is becoming an algorithm. The question is: whose algorithm?\u201D', time: '2h', views: '890K', likes: '42K', comments: '5.8K', tags: ['tech', 'ai'], isNew: true, delay: 320 },
  { id: '37', type: 'compact', platform: 'x', title: 'Shipped v4 of our design system', author: 'Rasmus Andersson', subtitle: '\u201C2 years, 340 components, zero breaking changes on upgrade. The secret? Treating tokens as API contracts.\u201D', time: '4h', views: '120K', likes: '8.9K', comments: '620', tags: ['design', 'tech'], delay: 380 },
  { id: '38', type: 'compact', platform: 'x', title: 'Thread: Why every streamer should learn to code', author: 'Ludwig', subtitle: '\u201CYou don\u2019t need to build the next Twitch. But understanding how your tools work changes everything about how you use them.\u201D', time: '1h', views: '2.1M', likes: '95K', comments: '12K', tags: ['tech', 'entertainment', 'gaming'], isNew: true, delay: 440 },

  // === Explore / Trending ===
  { id: '13', type: 'std', platform: 'youtube', title: 'The Unreasonable Effectiveness of Mathematics', author: 'Veritasium', subtitle: 'Why does math describe reality so perfectly?', time: '5h', views: '3.2M', likes: '210K', comments: '15K', tags: ['science', 'math', 'philosophy'], delay: 100, videoId: 'fNk_zzaMoSs' },
  { id: '14', type: 'compact', platform: 'x', title: 'Sam Altman on AGI timelines', author: 'Sam Altman', subtitle: '\u201CWe\'re closer than most people think but further than most AI researchers think.\u201D', time: '1h', views: '1.1M', likes: '45K', comments: '8.2K', tags: ['ai', 'startups'], isNew: true, delay: 160 },
  { id: '15', type: 'std', platform: 'youtube', title: 'Why Gravity is NOT a Force', author: 'Veritasium', subtitle: 'General relativity reframed in 20 minutes.', time: '2d', views: '18M', likes: '890K', comments: '42K', tags: ['science', 'physics'], delay: 220, videoId: 'XRr1kaXKBsU' },
  { id: '24', type: 'live', platform: 'kick', title: 'IRL Tokyo Night Walk', author: 'JakenbakeLIVE', subtitle: 'Exploring Shibuya at midnight.', viewers: '15K', views: '52K', likes: '3.4K', tags: ['culture', 'entertainment'], delay: 280, channelId: 'jakenbakelive' },
  { id: '25', type: 'std', platform: 'youtube', title: 'How Spotify\u2019s Algorithm Actually Works', author: 'Undecided', subtitle: 'The collaborative filtering behind Discover Weekly.', extra: 'Deep dive into matrix factorization, natural language processing of music reviews, and the audio features API that powers recommendations.', time: '3h', views: '980K', likes: '67K', comments: '4.1K', tags: ['tech', 'music'], delay: 340, videoId: 'PBEJQDJxBPU' },
  { id: '26', type: 'compact', platform: 'x', title: 'Thread: What makes a city great', author: 'Patrick Collison', subtitle: '\u201CDensity, walkability, and the freedom to be weird. Everything else follows.\u201D', time: '8h', views: '430K', likes: '28K', comments: '3.4K', tags: ['culture', 'philosophy'], delay: 400 },
  { id: '27', type: 'std', platform: 'substack', title: 'The Taste Graph', author: 'Kyle Chayka', subtitle: 'How algorithms flatten culture into aesthetic sameness.', extra: 'From AirSpace to algorithmic recommendations, an argument that optimization erodes the serendipity that makes culture interesting.', time: '1d', views: '290K', likes: '22K', tags: ['culture', 'design'], delay: 460 },
  { id: '28', type: 'std', platform: 'youtube', title: 'Building in Public: Month 6', author: 'Daniel Bourke', subtitle: 'Revenue, mistakes, and what I\u2019d do differently.', extra: 'An honest retrospective on building a machine learning course business. Covers pricing experiments, content strategy, and burnout.', time: '10h', views: '520K', likes: '38K', comments: '2.9K', tags: ['startups', 'coding'], delay: 520, videoId: 'l6S0dSF-DLE' },
  { id: '29', type: 'compact', platform: 'x', title: 'The future of interfaces', author: 'Amelia Wattenberger', subtitle: '\u201CThe best interface is no interface. The second best is one that anticipates.\u201D', time: '4h', views: '78K', likes: '5.6K', comments: '420', tags: ['design', 'ai'], isNew: true, delay: 580 },
  { id: '30', type: 'live', platform: 'twitch', title: 'Music Production \u2014 Lo-fi Beats', author: 'KennyBeats', subtitle: 'Making a beat from scratch. Chat picks the samples.', viewers: '24K', views: '96K', likes: '7.2K', tags: ['music', 'entertainment'], delay: 640, channelId: 'kennybeats' },
  { id: '31', type: 'std', platform: 'substack', title: 'Against Best Practices', author: 'Robin Sloan', subtitle: 'Why defaults are the enemy of great work.', extra: 'A meditation on how the most interesting creative and technical work comes from ignoring conventional wisdom and following instinct.', time: '1d', views: '185K', likes: '15K', tags: ['philosophy', 'culture', 'design'], delay: 700 },
];

// For You: X + YouTube browse + Twitch browse (discovery content)
// Positions: Kaicenat(21) tarik(22) HasanAbi(23) Karpathy(2) Balaji(25) Ludwig(27)
// 3B1B(1) Fireship(6) Noodl(7) Cheese(24) Rasmus(26) Sahil(8)
// StableRonaldo(0) CodeWithFire(5) TenZ(9) Dwarkesh(3) You(4) MattLevine(10)
export const fyIdx = [21, 22, 23, 2, 25, 27, 1, 6, 7, 24, 26, 8, 0, 5, 9, 3, 4, 10];
// Following: kept for harness compatibility — FollowingFeed renders its own sections
export const flIdx = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
// Explore: shifted +7 after new items inserted
export const exIdx = [28, 29, 30, 31, 32, 33, 35, 36, 37];

// Pre-built mock pools for fallback when APIs aren't configured
export const mockFyItems = fyIdx.map((i) => allContent[i]);
export const mockFlItems = flIdx.map((i) => allContent[i]);
export const mockExItems = exIdx.map((i) => allContent[i]);

// Notifications are now generated dynamically from content — see lib/notifications.ts
