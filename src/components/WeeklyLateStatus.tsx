import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const pieData = [
  { name: '遅刻', value: 20 },
  { name: '欠勤', value: 10 },
  { name: '出勤', value: 70 },
];

const COLORS = ['#FFBB00', '#CC3D3D', '#A6D9FF'];

const WeeklyLateStatus = () => {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 20, display: 'flex', gap: 30 }}>
      <div style={{ width: 220, height: 260 }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: 10 }}>遅刻および欠勤の状況</h3>
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
          <div><span style={{ color: COLORS[0] }}>■</span> 遅刻 : 00％</div>
          <div><span style={{ color: COLORS[1] }}>■</span> 欠勤 : 00％</div>
          <div><span style={{ color: COLORS[2] }}>■</span> 出勤 : 00％</div>
        </div>
      </div>

      <table style={{ borderCollapse: 'collapse', fontSize: 14, flexGrow: 1 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc', backgroundColor: 'transparent' }}>
            <th style={{ padding: 8 }}>日付</th>
            <th style={{ padding: 8 }}>00 / 00（月）</th>
            <th style={{ padding: 8 }}>00 / 00（火）</th>
            <th style={{ padding: 8 }}>00 / 00（水）</th>
            <th style={{ padding: 8 }}>00 / 00（木）</th>
            <th style={{ padding: 8 }}>00 / 00（金）</th>
            <th style={{ padding: 8 }}>00 / 00（土）</th>
            <th style={{ padding: 8 }}>00 / 00（日）</th>
          </tr>
        </thead>
        <tbody>
          {[
            {
              label: '状態',
              values: [
                <span style={{ color: COLORS[2] }}>正常</span>,
                <span style={{ color: COLORS[0] }}>遅刻</span>,
                <span style={{ color: COLORS[1] }}>欠勤</span>,
                '-', '-', '-', '-', 
              ]
            },
            {
              label: '到着時間',
              values: [
                '08:00',
                <span style={{ color: COLORS[0] }}>09:17</span>,
                '-',
                '-', '-', '-', '-', 
              ]
            }
          ].map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
              <td
                style={{
                  padding: 8,
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap', // ✅ 줄바꿈 방지
                  minWidth: 80,          // ✅ 최소 너비 확보
                }}
              >
                {row.label}
              </td>
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
