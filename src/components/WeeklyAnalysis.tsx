import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

type ColorKeys = '勤務時間' | '残業時間' | '残り時間' | '透明';

type WeeklyAnalysisProps = {
  startDate: string; // 例: "2025-08-12"
  endDate: string;   // 例: "2025-08-18"
};

const barData: { name: string; 勤務時間: number; 残業時間: number; 残り時間: number }[] = [
  { name: '月', 勤務時間: 8, 残業時間: 2, 残り時間: 0 },
  { name: '火', 勤務時間: 7, 残業時間: 3, 残り時間: 0 },
  { name: '水', 勤務時間: 6, 残業時間: 4, 残り時間: 0 },
  { name: '木', 勤務時間: 8, 残業時間: 2, 残り時間: 0 },
  { name: '金', 勤務時間: 9, 残業時間: 1, 残り時間: 0 },
  { name: '土', 勤務時間: 0, 残業時間: 0, 残り時間: 10 },
  { name: '日', 勤務時間: 0, 残業時間: 0, 残り時間: 10 },
];

const totalOvertime = barData.reduce((sum, day) => sum + day.残業時間, 0);
const maxOvertime = 24; // 1日の最大残業可能時間（透明部分の計算用）

const workAndRemainData: { name: ColorKeys; value: number }[] = [
  { name: '勤務時間', value: barData.reduce((sum, day) => sum + day.勤務時間, 0) },
  { name: '残り時間', value: barData.reduce((sum, day) => sum + day.残り時間, 0) },
];

const overtimeData: { name: ColorKeys; value: number }[] = [
  { name: '残業時間', value: totalOvertime },
  { name: '透明', value: maxOvertime - totalOvertime },
];

const COLORS: Record<ColorKeys, string> = {
  勤務時間: '#87CEFA', // 薄い空色
  残業時間: '#6A0DAD', // 濃い紫色
  残り時間: '#A9A9A9', // 濃いグレー
  透明: 'transparent',
};

// 日付文字列を日本式フォーマットに変換する関数
const formatDateToJapanese = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-');
  return `${year}年${month}月${day}日`;
};

// 커스텀 범례 컴포넌트
const CustomLegend = () => (
  <div
    style={{
      position: 'absolute',
      left: '30%',     // 화요일과 수요일 사이쯤 위치 (필요시 조절)
      bottom: 10,     // 막대그래프 아래 위치
      display: 'flex',
      gap: 20,
      fontSize: 16,
      fontWeight: 'bold',
      color: '#eee',
    }}
  >
    <span style={{ color: COLORS.勤務時間 }}>■ 勤務時間</span>
    <span style={{ color: COLORS.残り時間 }}>■ 残り時間</span>
    <span style={{ color: COLORS.残業時間 }}>■ 残業時間</span>
  </div>
);

const WeeklyAnalysis = ({ startDate, endDate }: WeeklyAnalysisProps) => {
  return (
    <div
      style={{
        marginBottom: 40,
        border: '1px solid #ccc',
        borderRadius: 8,
        padding: 20,
        boxSizing: 'border-box',
        minHeight: 320,
      }}
    >
      <h3 style={{ marginBottom: 10, fontWeight: 'bold' }}>週間勤務時間合計</h3>

      <div style={{ textAlign: 'center', marginBottom: 10, fontWeight: 'bold', fontSize: 14 }}>
        【 {formatDateToJapanese(startDate)} ～ {formatDateToJapanese(endDate)} 】
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* 막대그래프 */}
        <div style={{ width: '70%', height: 200, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {/* 기존 Legend 제거 */}
              <Bar dataKey="勤務時間" stackId="a" fill={COLORS.勤務時間} />
<Bar dataKey="残業時間" stackId="a" fill={COLORS.残業時間} />
<Bar dataKey="残り時間" stackId="a" fill={COLORS.残り時間} />
            </BarChart>
          </ResponsiveContainer>

          {/* 커스텀 범례 */}
          <CustomLegend />
        </div>

        {/* 도넛차트 */}
        <div style={{ width: 200, height: 200, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
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

          {/* 텍스트 박스 */}
          <div
            style={{
              fontSize: 12,
              marginTop: -40,
              width: 200,
              maxHeight: 'none',
              overflow: 'visible',
              paddingRight: 8,
              boxSizing: 'border-box',
              wordBreak: 'break-all',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }}
          >
            <div>
              <span style={{ color: COLORS.勤務時間 }}>■</span> 勤務時間 : {workAndRemainData[0].value} 時間
            </div>
            <div>
              <span style={{ color: COLORS.残り時間 }}>■</span> 残り時間 : {workAndRemainData[1].value} 時間
            </div>
            <div>
              <span style={{ color: COLORS.残業時間 }}>■</span> 残業時間 : {totalOvertime} 時間
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyAnalysis;
