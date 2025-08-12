import { useEffect, useState } from "react";
import { Client } from '@stomp/stompjs';

export default function Notification() {
  
    const [unreadCount, setUnreadCount] = useState(0);
    //const [stompClient, setStompClient] = useState<Client | null>(null);

    useEffect(() => {
        // STOMP 클라이언트 생성
        const client = new Client({
            brokerURL: 'ws://localhost:3980/ws',  // 실제 WebSocket URL
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
            },
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe('/user/queue/notification', (message) => {
                    const data = JSON.parse(message.body);
                    alert(
                        data.writer +"\n"+
                        data.title  +"\n"+
                        data.writeDate +"\n"+
                        data.message
                    );

                    // 새 알림 도착 시 미읽음 카운트 증가 or 알림 상태 업데이트
                    setUnreadCount((count) => count + 1);
                });
            }
        });

        client.activate();
        //setStompClient(client);

        return () => {
            console.log("여기는 들어왔어?4")
            client.deactivate();
        };
    }, []);

    // 알림 벨 클릭 시 (예: 알림 목록 열기 또는 미읽음 초기화)
    const handleBellClick = () => {
        setUnreadCount(0);
    };

    return (
    <button 
      className="relative p-2 focus:outline-none"
      onClick={handleBellClick}
      aria-label="알림 보기"
    >
      {/* 벨 아이콘 (SVG) */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-10 w-10 text-white" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
      >
        <path 
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* 읽지 않은 알림 개수 뱃지 */}
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-600 ring-2 ring-white" />
      )}
    </button>
  );
}