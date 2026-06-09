export default function LoadingSpinner({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center w-full py-12">
      <div
        className="rounded-full animate-spin"
        style={{
          width: size,
          height: size,
          border: '3px solid rgba(212,175,55,0.2)',
          borderTopColor: '#D4AF37',
        }}
      />
    </div>
  );
}
