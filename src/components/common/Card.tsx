export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-3xl border-2 border-duo-gray bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
