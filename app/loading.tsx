export default function Loading() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 20px 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            style={{
              height: 200,
              borderRadius: 14,
              background: 'var(--skel-a, #141312)',
              animation: 'shimmer 1.8s ease infinite',
              backgroundImage: 'linear-gradient(90deg, var(--skel-a, #141312) 25%, var(--skel-b, #1C1A18) 50%, var(--skel-a, #141312) 75%)',
              backgroundSize: '200% 100%',
            }}
          />
        ))}
      </div>
    </div>
  );
}
