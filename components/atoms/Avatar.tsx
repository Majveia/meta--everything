interface AvatarProps {
  name: string;
  color: string;
  size?: number;
}

export default function Avatar({ name, color, size = 28 }: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}40, ${color}18)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `1.5px solid ${color}25`,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-body), 'Outfit', sans-serif",
          fontSize: size * 0.4,
          fontWeight: 500,
          color,
          opacity: 0.9,
        }}
      >
        {name[0]}
      </span>
    </div>
  );
}
