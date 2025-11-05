
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: any[];
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 h-96">
        <h3 className="text-lg font-semibold mb-4 text-white">Évolution du chiffre d’affaires</h3>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 25,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                <XAxis dataKey="name" stroke="#a0aec0" />
                <YAxis stroke="#a0aec0" />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }}
                    labelStyle={{ color: '#a0aec0' }}
                />
                <Legend wrapperStyle={{color: '#a0aec0'}} />
                <Line type="monotone" dataKey="revenus" stroke="#e53e3e" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default Chart;
