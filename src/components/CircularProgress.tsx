export function CircularProgress({
  percent,
  size = 96,
  strokeWidth = 10,
}: {
  percent: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percent / 100) * circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="h-full w-full -rotate-90 transform">
        {/* Background circle */}
        <circle
          className="text-primary-50"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="text-primary-600 transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Inner gold ring */}
        <circle
          className="text-gold-400"
          strokeWidth={1.5}
          stroke="currentColor"
          fill="transparent"
          r={radius - strokeWidth / 2 - 2}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span
        className="font-heading absolute font-semibold text-slate-800"
        style={{ fontSize: size * 0.25 }}
      >
        {percent}%
      </span>
    </div>
  )
}
