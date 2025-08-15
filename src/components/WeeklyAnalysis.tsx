import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

type ColorKeys = '근무시간' | '잔업시간' | '잔여시간' | '투명';

const barData: { name: string; 근무시간: number; 잔업시간: number; 잔여시간: number }[] = [
  { name: '월', 근무시간: 8, 잔업시간: 2, 잔여시간: 0 },
  { name: '화', 근무시간: 7, 잔업시간: 3, 잔여시간: 0 },
  { name: '수', 근무시간: 6, 잔업시간: 4, 잔여시간: 0 },
  { name: '목', 근무시간: 8, 잔업시간: 2, 잔여시간: 0 },
  { name: '금', 근무시간: 9, 잔업시간: 1, 잔여시간: 0 },
  { name: '토', 근무시간: 0, 잔업시간: 0, 잔여시간: 10 },
  { name: '일', 근무시간: 0, 잔업시간: 0, 잔여시간: 10 },
];

const totalOvertime = barData.reduce((sum, day) => sum + day.잔업시간, 0);
const maxOvertime = 24; // 하루 최대 잔업 가능 시간 (투명 부분 계산용)

const workAndRemainData: { name: ColorKeys; value: number }[] = [
  { name: '근무시간', value: barData.reduce((sum, day) => sum + day.근무시간, 0) },
  { name: '잔여시간', value: barData.reduce((sum, day) => sum + day.잔여시간, 0) },
];

const overtimeData: { name: ColorKeys; value: number }[] = [
  { name: '잔업시간', value: totalOvertime },
  { name: '투명', value: maxOvertime - totalOvertime },
];

const COLORS: Record<ColorKeys, string> = {
  근무시간: '#87CEFA', // 옅은 하늘색
  잔업시간: '#6A0DAD', // 진한 보라색
  잔여시간: '#A9A9A9', // 짙은 회색
  투명: 'transparent',
};

const WeeklyAnalysis = () => {
  return (
    <div style={{ marginBottom: 40, border: '1px solid #ccc', borderRadius: 8, padding: 20 }}>
      <h3 style={{ marginBottom: 10, fontWeight: 'bold' }}>주간 근무 시간 합계</h3>

      {/* 날짜 위치 위쪽 중앙으로 변경 */}
      <div style={{ textAlign: 'center', marginBottom: 10, fontSize: 14, fontWeight: 'bold' }}>
        2025-00-00 ~ 2025-00-00
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* 막대그래프 */}
        <div style={{ width: '70%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="근무시간" stackId="a" fill={COLORS.근무시간} />
              <Bar dataKey="잔업시간" stackId="a" fill={COLORS.잔업시간} />
              <Bar dataKey="잔여시간" stackId="a" fill={COLORS.잔여시간} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 도넛차트 */}
        <div style={{ width: 200, height: 200, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* 외부 도넛: 잔업시간만큼 보라색, 나머지는 투명 */}
              <Pie
                data={overtimeData}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={90 + (360 * totalOvertime) / maxOvertime}
                innerRadius={70}
                outerRadius={90}
                dataKey="value"
                cornerRadius={5}
                stroke="none"
                paddingAngle={0}
              >
                {overtimeData.map((entry, index) => (
                  <Cell key={`outer-cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>

              {/* 내부 도넛: 근무시간/잔여시간 */}
              <Pie
                data={workAndRemainData}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={450}
                innerRadius={40}
                outerRadius={65}
                dataKey="value"
                cornerRadius={5}
                stroke="none"
                paddingAngle={5}
              >
                {workAndRemainData.map((entry, index) => (
                  <Cell key={`inner-cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

  <div
  style={{
    fontSize: 12,
    marginTop: 10,
    width: '200px',
    maxHeight: '70px',
    overflowY: 'auto',
    overflowX: 'hidden',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    paddingRight: 8,
    boxSizing: 'border-box',
    flexShrink: 0,
  }}
>
  <div>
    <span style={{ color: COLORS.근무시간, wordBreak: 'break-word', whiteSpace: 'normal' }}>■</span> 근무시간 : {workAndRemainData[0].value} 시간
  </div>
  <div>
    <span style={{ color: COLORS.잔여시간, wordBreak: 'break-word', whiteSpace: 'normal' }}>■</span> 잔여시간 : {workAndRemainData[1].value} 시간
  </div>
  <div>
    <span style={{ color: COLORS.잔업시간, wordBreak: 'break-word', whiteSpace: 'normal' }}>■</span> 잔업시간 : {totalOvertime} 시간
  </div>
</div>


        </div>
      </div>
    </div>
  );
};

export default WeeklyAnalysis;
