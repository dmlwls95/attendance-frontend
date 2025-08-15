import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const pieData = [
  { name: '지각', value: 20 },
  { name: '결근', value: 10 },
  { name: '출근', value: 70 },
];

// 색상: 지각(노랑), 결근(빨강), 출근(하늘색)
const COLORS = ['#FFBB00', '#CC3D3D', '#A6D9FF'];

const WeeklyLateStatus = () => {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 20, display: 'flex', gap: 30 }}>
      <div style={{ width: 200, height: 200 }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: 10 }}>지각 및 결근 현황</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* 범례 */}
        <div style={{ fontSize: 12, marginTop: 10 }}>
          <div><span style={{ color: COLORS[0] }}>■</span> 지각 : 00 %</div>
          <div><span style={{ color: COLORS[1] }}>■</span> 결근 : 00 %</div>
          <div><span style={{ color: COLORS[2] }}>■</span> 출근 : 00 %</div>
        </div>
      </div>

      <table style={{ borderCollapse: 'collapse', fontSize: 14, flexGrow: 1 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc', backgroundColor: 'transparent' }}>
            <th style={{ padding: 8 }}>날짜</th>
            <th style={{ padding: 8 }}>00 / 00 (월)</th>
            <th style={{ padding: 8 }}>00 / 00 (화)</th>
            <th style={{ padding: 8 }}>00 / 00 (수)</th>
            <th style={{ padding: 8 }}>00 / 00 (목)</th>
            <th style={{ padding: 8 }}>00 / 00 (금)</th>
            <th style={{ padding: 8 }}>00 / 00 (토)</th>
            <th style={{ padding: 8 }}>00 / 00 (일)</th>
          </tr>
        </thead>
        <tbody>
          {[
            {
              label: '상태',
              values: [
                <span style={{ color: COLORS[2] }}>정상</span>,
                <span style={{ color: COLORS[0] }}>지각</span>,
                <span style={{ color: COLORS[1] }}>결근</span>,
                '-', '-', '-', '-', '-',
              ]
            },
            {
              label: '도착시간',
              values: [
                '08:00',
                <span style={{ color: COLORS[0] }}>09:17</span>,
                '-',
                '-', '-', '-', '-', '-'
              ]
            }
          ].map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 8, fontWeight: 'bold' }}>{row.label}</td>
              {row.values.map((val, idx) => (
                <td key={idx} style={{ padding: 8, textAlign: 'center' }}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyLateStatus;
