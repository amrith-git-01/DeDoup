import type { StatCardProps } from '../../types/ui';

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-blue-500',
  valueColor = 'text-gray-900',
}: StatCardProps) {
  return (
    <div className="ui-hover-card bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-28 cursor-pointer">
      <div className="flex justify-between items-start">
        <span className="text-gray-500 font-medium text-sm">{label}</span>
        <Icon size={18} className={iconColor} />
      </div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}
