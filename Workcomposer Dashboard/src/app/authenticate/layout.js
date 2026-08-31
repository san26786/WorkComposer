export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {children}
    </div>
  );
}