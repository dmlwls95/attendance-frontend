const WeeklyTable = () => {
  return (
    <div style={{ marginBottom: 40, border: '1px solid #007bff', borderRadius: 8, padding: 20 }}>
      <h3 style={{ fontWeight: 'bold', marginBottom: 15 }}>주간 근로 분석</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #007bff', backgroundColor: 'transparent' }}>
            <th style={{ padding: 10 }}>날짜</th>
            <th style={{ padding: 10 }}>00 / 00 (월)</th>
            <th style={{ padding: 10 }}>00 / 00 (화)</th>
            <th style={{ padding: 10 }}>00 / 00 (수)</th>
            <th style={{ padding: 10 }}>00 / 00 (목)</th>
            <th style={{ padding: 10 }}>00 / 00 (금)</th>
            <th style={{ padding: 10 }}>00 / 00 (토)</th>
            <th style={{ padding: 10 }}>00 / 00 (일)</th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: '정상 근무', values: ['08:00', '08:00', '-', '-', '-', '-', '-'] },
            { label: '연장 근무', values: ['-', '01:00', '-', '-', '-', '-', '-'] },
            { label: '총 합계', values: ['09:00', '09:00', '-', '-', '-', '-', '-'] },
            { label: '처리 상태', values: ['정상확인', '정상확인', '-', '-', '-', '휴일', '휴일'] },
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
