
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export function GradesGraph({ data }) {
    // Generate mock data if none provided
    const chartData = [
        { name: 'Assignment 1', score: 85, avg: 72 },
        { name: 'Assignment 2', score: 92, avg: 75 },
        { name: 'Assignment 3', score: 78, avg: 80 },
        { name: 'Assignment 4', score: 95, avg: 78 },
        { name: 'Assignment 5', score: 88, avg: 76 },
    ];

    return (
        <div className="w-full h-full min-h-[300px] flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-poppins font-bold text-brand-navy">Grades 📊</h3>
                <div className="flex gap-4 text-xs font-bold text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-light-gray" /> class avg.</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-orange" /> Your grades</span>
                </div>
            </div>

            <p className="text-gray-400 text-sm mb-4 italic font-instrument">Mistakes are proof that you are trying 🌱</p>

            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data || chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE9F1" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#7C8DB5' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#7C8DB5' }}
                            domain={[0, 100]}
                            tickFormatter={(value) => {
                                if (value >= 90) return 'A';
                                if (value >= 80) return 'B';
                                if (value >= 70) return 'C';
                                if (value >= 60) return 'D';
                                return 'F';
                            }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            cursor={{ stroke: '#D2D2E3', strokeWidth: 2 }}
                        />
                        <Line type="monotone" dataKey="avg" stroke="#D2D2E3" strokeWidth={2} dot={{ r: 4, fill: '#D2D2E3' }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="score" stroke="#F24400" strokeWidth={3} dot={{ r: 4, fill: '#F24400' }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
