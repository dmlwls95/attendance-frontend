import { useEffect, useState } from "react";
import axios from 'axios';
import { createStompClient } from '../socket/stompClient';
import APIConfig from '../configs/API.config';
import './NotificationDropdown.css';

interface notificationInfo {
    id: number,
    boardid: number,
    title: string,
    writeDate: string,
    message: string,
    writer: string,
    isRead: boolean
}

export default function Notification() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<notificationInfo[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const client = createStompClient();

    const connectSocket = () => {
        client.subscribe('/user/queue/notification', (message) => {
            const data = JSON.parse(message.body);
            setNotifications(prev => [{ ...data, isRead: false }, ...prev]);
            console.log(data.boardid);
            setUnreadCount((count) => count + 1);
        });
    };

    const closeSocket = () => {
        if (client)
            client.deactivate();
    }

    useEffect(() => {
        client.onConnect = connectSocket;
        client.activate();
        return () => closeSocket();
    }, []);


    const notificationIconClick = () => {
        setIsOpen(prev => !prev);
        { console.log(notifications) }
    }

    const notReadToRead = async (index: number) => {
        const notification = notifications[index];

        try {
            if (!notification.isRead) {
                await axios.post(`${APIConfig}/notification/${notification.id}/read`, null, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}`, },
                });

                const update = notifications.map((item, i) =>
                    i === index ? { ...item, isRead: true } : item
                );
                setNotifications(update);
            }
            openNoticeWindow(notification.boardid);
        } catch (e) { console.error("알림 읽음 처리 실패", e); }

    }

    const openNoticeWindow = (board_id: number) => {

        window.open(
            `/user/userboard/detail/${board_id}/notice`,
            '_blank',
            'width=600,height=900,left=100,top=100'
        );
    }

    const deleteNotification = async (index: number) => {

        const notification = notifications[index];

        try {
            await axios.delete(`${APIConfig}/notification/${notification.id}/delete`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
            });
            setNotifications(prev => prev.filter((_, i) => i !== index));
        } catch (e) { console.error("삭제 처리 실패", e); }

    }

    useEffect(() => {
        const readCount = notifications.filter(noti => noti.isRead).length;
        const totalUnread = notifications.length - readCount;
        setUnreadCount(totalUnread);

        if (notifications.length > 20) {
            // 읽은 알림들만 필터링
            const readNotis = notifications
                .map((noti, idx) => ({ ...noti, index: idx }))
                .filter(noti => noti.isRead);

            if (readNotis.length > 0) {
                // 가장 오래된 알림 1개 삭제 (맨 마지막 읽은 항목)
                const oldest = readNotis[readNotis.length - 1];
                deleteNotification(oldest.index);
            }
            else {
                deleteNotification(notifications.length - 1);
            }
        }
    }, [notifications]);

    return (
        <div className="relative inline-block">
            <button
                className="relative p-2 rounded-full border-2"
                onClick={notificationIconClick}
                aria-label="알림 보기"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10"
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

                {unreadCount > 0 && (
                    <span
                        className={`absolute top-0 right-0 flex items-center justify-center h-5 rounded-full bg-red-600 ring-2 ring-white text-white text-sm font-bold ${unreadCount > 10 ? 'min-w-[1.5rem] px-1' : 'w-5'}`}
                    >
                        {unreadCount > 10 ? '10+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="absolute top-[calc(100%+10px)] left-0 w-[342px] h-[50px] bg-gray-800 z-50 flex items-center rounded-tl rounded-tr border border-gray-500">
                        <strong className="pl-4 text-gray-100 text-base">알림</strong>
                    </div>

                    <div className="overflow-y-scroll"></div>
                    <div
                        className="absolute top-[calc(100%+60px)] left-0 w-[342px] h-[600px] overflow-y-scroll bg-gray-800 shadow-md z-50 p-2 space-y-2 rounded-bl rounded-br border-l border-b border-r border-gray-500"
                    >
                        {notifications.length > 0 ? (
                            <>
                                {notifications.map((notification, index) => (
                                    <div
                                        key={index}
                                        onClick={() => notReadToRead(index)}
                                        className={`p-2 cursor-pointer border-2 border-gray-300 rounded-md ${notification.isRead ? "bg-gray-300 text-gray-400" : "bg-white text-black"
                                            }`}
                                    >
                                        <div className="flex-1 w-full">
                                            <div className="font-semibold">{notification.title}</div>
                                            <div className="text-sm">{notification.message}</div>
                                            <div className="text-xs text-gray-400 mt-1">작성자: {notification.writer}</div>
                                            <div className="text-xs text-gray-400">{notification.writeDate}</div>
                                        </div>
                                    </div>
                                ))}

                                {/* 👇 최소 높이 보장용 빈 공간 */}
                                <div style={{ minHeight: "1000px" }} />
                            </>
                        ) : (
                            <>
                                <div className="text-center pt-20 text-gray-400 text-2xl">새로운 알림이 없습니다.</div>
                                <div className="text-center pt-5 pr-14 pl-14 text-gray-400">근태 관리 시스템의 알람을 이곳에서 모아볼 수 있어요.</div>
                                <div style={{ height: "1000px" }} />
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}