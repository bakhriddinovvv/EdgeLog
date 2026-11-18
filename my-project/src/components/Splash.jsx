export default function Splash({ children }) {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 p-6 text-center text-neutral-400">
      <div>{children}</div>
    </div>
  );
}
