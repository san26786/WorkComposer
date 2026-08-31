export default function IntegrationCard({
  icon,
  title,
  description,
  connected,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className="p-5 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm cursor-pointer transition flex items-start justify-between bg-white"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>

      {/* Connected Badge */}
      {connected ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Connected
        </span>
      ) : (
        <span className="text-xs text-gray-400 font-medium shrink-0 pt-1">
          Not connected
        </span>
      )}
    </div>
  );
}