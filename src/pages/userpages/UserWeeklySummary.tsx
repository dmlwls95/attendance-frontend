import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs"
import isoWeek from 'dayjs/plugin/isoWeek';
import { getWeeklyData, type WeeklyDashboardResponse, type DayOfWeekResponse } from "../../services/UserWeeklySummaryService";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const COLORS = {
  chart: {
    work: "#99A1EE", // 근무 시간
    left: "#2DD4BF", // 잔여 시간
    over: "#828892", // 잔업 시간
    holiday:"#FFB7AE" // 휴일
  }
};

const UserWeeklySummary: React.FC = () => {

  const [weekdata, setWeekdata] = useState<WeeklyDashboardResponse>();
  const [daydatas, setDaydatas] = useState<DayOfWeekResponse[]>([]);

  const CHART_ICON_SRC = "/ChartLine.svg";
  const TABLE_ICON_SRC = "/Table.svg";

  const now = new Date("2025-08-13");//dayjs();
  const year = now.getFullYear();
  const month = now.getMonth();

  // 이번 달의 첫 번째 날
  const startOfMonth = new Date(year, month, 1);

  // 오늘 날짜가 이번 달의 며칠째인지
  const dateInMonth = now.getDate();

  // 이번 달의 첫 날이 무슨 요일인지 (0: 일요일, 1: 월요일, ...)
  const startWeekDay = startOfMonth.getDay();

  // 몇 번째 주인지 계산 (1-based)
  const weekInMonth = Math.ceil((dateInMonth + startWeekDay) / 7);

  const startOfWeek = daydatas.length >= 7 ? daydatas[0].date : null;
  const endOfWeek = daydatas.length >= 7 ? daydatas[6].date : null;


  const [iconOk, setIconOk] = useState(true);

  const getWeeklySummaryDatas = async () => {
    try {
      const data = await getWeeklyData("2025-08-13");//(now.format("YYYY-MM-DD"));

      setWeekdata(data);
      setDaydatas(data.info);

      console.log("주간 근로 데이터 확인 : ", data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getWeeklySummaryDatas();
  }, []);


  return (
    <div className="rounded-xl shadow-sm p-5 mb-6">
      {/* ───── 헤더 (아이콘 + 제목) ───── */}
      <div className="flex items-center gap-2 mb-4">
        {iconOk ? (
          <img
            src={CHART_ICON_SRC}
            alt="주간 차트 아이콘"
            className="w-6 h-6"
            onError={() => setIconOk(false)}
          />
        ) : (
          <div className="w-6 h-6 rounded bg-gray-300 grid place-items-center text-xs">📊</div>
        )}
        <h2 className="text-xl font-semibold">주간 근로 분석</h2>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="max-w-5xl mx-auto w-full">

          <div className="text-lg text-gray-500 font-semibold mb-5">
            {year}년 {month + 1}월 {weekInMonth}째주 근무 현황 (집계: {startOfWeek} ~ {endOfWeek})
          </div>

          <div className="flex gap-4 mb-1">
            <div className="w-2/3 bg-white rounded-lg border-2 border-gray-400">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={daydatas.map(daydata => ({
                    name: dayjs(daydata.date).format("MM/DD") + `${(daydata.dayOfweek)}`,
                    근무시간: daydata.workTime,
                    잔여시간: daydata.dayType == "WEEKEND" ? 0 : 540 - daydata.workTime,
                    잔업시간: daydata.overTime,
                  }))}
                  margin={{ top: 30, right: 20, bottom: -10, left: 0 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="근무시간" stackId="a" fill={COLORS.chart.work} />
                  <Bar dataKey="잔여시간" stackId="a" fill={COLORS.chart.left} />
                  <Bar dataKey="잔업시간" stackId="b" fill={COLORS.chart.over} />
                </BarChart>
              </ResponsiveContainer>
            </div>


            <div className="w-1/3 bg-white rounded-lg border-2 border-gray-400">
              <div className="flex gap-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "근무시간",
                          value: weekdata?.totalWorktime,
                          color: COLORS.chart.work
                        },
                        {
                          name: "잔여시간",
                          value: weekdata?.leftTime,
                          color: COLORS.chart.left
                        }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      startAngle={0}
                      endAngle={360}
                      innerRadius={70}
                      outerRadius={110}
                      cornerRadius={5}
                      paddingAngle={2}
                    >
                      {[
                        COLORS.chart.work,
                        COLORS.chart.left
                      ].map((fill, index) => (
                        <Cell key={`cell-${index}`} fill={fill} />
                      ))}
                    </Pie>

                    <Pie
                      data={[
                        {
                          name: "잔업시간",
                          value: weekdata?.totalOvertime,
                          color: COLORS.chart.over
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      startAngle={0}
                      endAngle={weekdata
                        ? (360 * (weekdata.totalOvertime)) / (10 * 60)
                        : 0}
                      innerRadius={20}
                      outerRadius={60}
                      cornerRadius={5}
                      paddingAngle={2}
                    >
                      {/* 색상 지정도 inline으로 */}
                      {[
                        COLORS.chart.over,
                      ].map((fill, index) => (
                        <Cell key={`cell-${index}`} fill={fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-semibold p-1">
                  <span style={{ color: COLORS.chart.work }}>■</span> 근무시간 : {weekdata?.totalWorktime} 시간
                </div>
                <div className="text-sm text-gray-500 font-semibold p-1">
                  <span style={{ color: COLORS.chart.left }}>■</span> 잔여시간 : {weekdata?.leftTime} 시간
                </div>
                <div className="text-sm text-gray-500 font-semibold p-1">
                  <span style={{ color: COLORS.chart.over }}>■</span> 잔업시간 : {weekdata?.totalOvertime} 시간
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 주간 근로 분석 테이블 */}
      <div className="flex items-center gap-2 mb-4">
        {iconOk ? (
          <img
            src={TABLE_ICON_SRC}
            alt="주간 테이블 아이콘"
            className="w-6 h-6"
            onError={() => setIconOk(false)}
          />
        ) : (
          <div className="w-6 h-6 rounded bg-gray-300 grid place-items-center text-xs">📊</div>
        )}
        <h2 className="text-xl font-semibold">주간 테이블</h2>
      </div>

      <div className="bg-white rounded-xl p-4 mb-6">
        <table className="text-sm text-gray-700 table-fixed w-full">
          <thead>
            <tr>
              <th className="p-2 w-1/8 text-center border-b-2 border-gray-400">날 짜</th>
              {daydatas.map((daydata, index) => (
                <th className="p-2 w-1/7 text-center border-b-2 border-gray-400" key={index}>
                  {dayjs(daydata.date).format("MM/DD")} ({daydata.dayOfweek})
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              <th className="p-2 w-1/8 text-center border-b-2 border-gray-400">근 무 시 간</th>
              {daydatas.map((daydata, index) => (
                <th className="p-2 w-1/7 text-center border-b-2 border-gray-400" key={index}>
                  {daydata.workTime != 0 ? `${String(Math.floor(daydata.workTime / 60)).padStart(2, '0')} : 
                    ${String(daydata.workTime % 60).padStart(2, '0')}` : `${"-"}`}
                </th>
              ))}
            </tr>

            <tr>
              <th className="p-2 w-1/8 text-center border-b-2 border-gray-400">잔 업 시 간</th>

              {daydatas.map((daydata, index) => (
                <th className="p-2 w-1/7 text-center border-b-2 border-gray-400" key={index}>
                  {daydata.overTime != 0 ? `${String(Math.floor(daydata.overTime / 60)).padStart(2, '0')} : 
                    ${String(daydata.overTime % 60).padStart(2, '0')}` : `${"-"}`}
                </th>
              ))}
            </tr>

            <tr>
              <th className="p-2 w-1/8 text-center border-b-2 border-gray-400">총 근무시간</th>

              {daydatas.map((daydata, index) => (
                <th className="p-2 w-1/7 text-center border-b-2 border-gray-400" key={index}>
                  {(daydata.workTime + daydata.overTime) != 0 ? `${String(Math.floor((daydata.workTime + daydata.overTime) / 60)).padStart(2, '0')} : 
                    ${String((daydata.workTime + daydata.overTime) % 60).padStart(2, '0')}` : `${"-"}`}
                </th>
              ))}
            </tr>

            <tr>
              <th className="p-2 w-1/8 text-center border-b-2 border-gray-400">비 고</th>

              {daydatas.map((daydata, index) => (
                <th className="p-2 w-1/7 text-center border-b-2 border-gray-400" key={index}>
                  {daydata.dayType == "WEEKDAY" ? daydata.status : daydata.dayType}
                </th>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/*지각 및 결근 현황 */}
      <div className="flex items-center gap-2 mb-4">
        {iconOk ? (
          <img
            src={TABLE_ICON_SRC}
            alt="주간 테이블 아이콘"
            className="w-6 h-6"
            onError={() => setIconOk(false)}
          />
        ) : (
          <div className="w-6 h-6 rounded bg-gray-300 grid place-items-center text-xs">📊</div>
        )}
        <h2 className="text-xl font-semibold">지각 및 결근 현황</h2>
      </div>
      <div className="flex gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 w-1/3 h-60">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={[
                  {
                    name: "정상출근",
                    value: weekdata?.info.filter(index => index.status === "NORMAL").length,
                    color: COLORS.chart.left
                  },
                  {
                    name: "지각",
                    value: weekdata?.info.filter(index => index.status === "LATE").length,
                    color: COLORS.chart.work
                  },
                  {
                    name: "휴일",
                    value: weekdata?.info.filter(index => index.dayType === "WEEKEND").length,
                    color: COLORS.chart.holiday
                  }
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                startAngle={0}
                endAngle={360}
                innerRadius={30}
                outerRadius={70}
                cornerRadius={5}
                paddingAngle={2}
              >
                {[
                  COLORS.chart.work,
                  COLORS.chart.left,
                  COLORS.chart.over,
                  COLORS.chart.holiday
                ].map((fill, index) => (
                  <Cell key={`cell-${index}`} fill={fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

        </div>

        <div className="bg-white rounded-xl p-4 flex-1 h-60">




        </div>
      </div>
    </div>
  );
};

export default UserWeeklySummary;