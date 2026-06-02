export default function LoadingSpinner({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center w-full py-12">
      <div
        className="border-4 border-[var(--color-border)] border-t-[var(--color-gold)] rounded-full animate-spin"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
