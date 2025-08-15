const WeeklyTable = () => {
  return (
    <div style={{ marginBottom: 40, border: '1px solid #007bff', borderRadius: 8, padding: 20 }}>
      <h3 style={{ fontWeight: 'bold', marginBottom: 15 }}>週間勤務分析</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #007bff', backgroundColor: 'transparent' }}>
            <th style={{ padding: 10 }}>日付</th>
            <th style={{ padding: 10 }}>00 / 00 (月)</th>
            <th style={{ padding: 10 }}>00 / 00 (火)</th>
            <th style={{ padding: 10 }}>00 / 00 (水)</th>
            <th style={{ padding: 10 }}>00 / 00 (木)</th>
            <th style={{ padding: 10 }}>00 / 00 (金)</th>
            <th style={{ padding: 10 }}>00 / 00 (土)</th>
            <th style={{ padding: 10 }}>00 / 00 (日)</th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: '通常勤務', values: ['08:00', '08:00', '-', '-', '-', '-', '-'] },
            { label: '残業', values: ['-', '01:00', '-', '-', '-', '-', '-'] },
            { label: '合計', values: ['09:00', '09:00', '-', '-', '-', '-', '-'] },
            { label: '処理状態', values: ['正常確認', '正常確認', '-', '-', '-', '休日', '休日'] },
          ].map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 10, fontWeight: 'bold' }}>{row.label}</td>
              {row.values.map((val, idx) => (
                <td key={idx} style={{ padding: 10, textAlign: 'center' }}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklyTable;
