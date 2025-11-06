import React from 'react';

interface BarChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.value), 0);
  const colors = ['bg-primary-500', 'bg-sky-500', 'bg-teal-500', 'bg-emerald-500', 'bg-lime-500'];

  if (data.length === 0) return null;

  return (
    <div className="space-y-3 p-2">
      {data.map((item, index) => (
        <div key={item.label} className="flex items-center gap-4">
          <div className="w-1/4 text-sm text-right truncate text-gray-600 dark:text-gray-400">{item.label}</div>
          <div className="w-3/4 flex items-center">
             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
              <div
                className={`${item.color || colors[index % colors.length]} h-6 rounded-full flex items-center justify-start pl-2`}
                style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`, minWidth: '4rem' }}
              >
                 <span className="text-xs font-medium text-white shadow-sm">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
