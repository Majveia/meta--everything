export interface Palette {
  bg: string;
  bgS: string;
  bgH: string;
  bdr: string;
  bdrS: string;
  bdrH: string;
  tx: string;
  txS: string;
  txM: string;
  txF: string;
  tc: string;
  tcG: string;
  am: string;
  tl: string;
  gn: string;
  card: string;
  cardB: string;
  sh: string;
  shL: string;
  navBg: string;
  ht: number;
  gl: string;
  skelA: string;
  skelB: string;
}

export const palettes: Record<'dark' | 'light', Palette> = {
  dark: {
    bg: '#0A0A0A',
    bgS: '#0F0E0D',
    bgH: '#141312',
    bdr: '#1C1A18',
    bdrS: '#141312',
    bdrH: '#282624',
    tx: '#E8E0D4',
    txS: '#9B9590',
    txM: '#6B6560',
    txF: '#3A3634',
    tc: '#BF5A3C',
    tcG: '#D4714F',
    am: '#E8A849',
    tl: '#3D8B8B',
    gn: '#4A9B6E',
    card: '#0F0E0D',
    cardB: '#1C1A18',
    sh: '0 4px 20px rgba(0,0,0,.35)',
    shL: '0 16px 56px rgba(0,0,0,.5)',
    navBg: 'rgba(15,14,13,.88)',
    ht: 0.018,
    gl: '06',
    skelA: '#161514',
    skelB: '#222120',
  },
  light: {
    bg: '#F5F1EB',
    bgS: '#FFFFFF',
    bgH: '#ECE7DF',
    bdr: '#DED5C8',
    bdrS: '#E8E1D8',
    bdrH: '#D0C5B6',
    tx: '#1A1816',
    txS: '#6B6560',
    txM: '#9B9590',
    txF: '#C8BFB3',
    tc: '#BF5A3C',
    tcG: '#D4714F',
    am: '#C4893A',
    tl: '#2E7A7A',
    gn: '#3D8B5E',
    card: '#FFFFFF',
    cardB: '#E4DCD0',
    sh: '0 4px 16px rgba(0,0,0,.05)',
    shL: '0 16px 56px rgba(0,0,0,.07)',
    navBg: 'rgba(255,255,255,.88)',
    ht: 0.012,
    gl: '03',
    skelA: '#EDE8E0',
    skelB: '#E2D9CC',
  },
};
