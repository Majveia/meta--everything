import { accentColors } from '@/lib/constants';

export default function LiveDot() {
  return (
    <span
      aria-label="Live"
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: accentColors.red,
        display: 'inline-block',
        animation: 'lp 2s ease infinite',
        boxShadow: `0 0 8px ${accentColors.red}50`,
      }}
    />
  );
}
