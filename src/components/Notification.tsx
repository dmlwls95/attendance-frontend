import { useEffect, useState } from "react";
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import APIConfig from '../configs/API.config';
import './NotificationDropdown.css';

export default function Notification() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const client = new Client({
        brokerURL: 'ws://localhost:9090/ws',
        reconnectDelay: 5000,
        connectHeaders: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        debug: function (str) {
            console.log(str);
        }
    });

    const connectSocket = () => {
        client.subscribe('/user/queue/notification', (message) => {
            const data = JSON.parse(message.body);
            setNotifications(prev => [{ ...data, isRead: false }, ...prev]);
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
        console.log(isOpen);
    }

    const notificationClick = (notification : any[]) => {
        if(unreadCount > 0 && notification.filter(noti => noti.isRead)){
            setUnreadCount((unreadCount) => unreadCount-1);
        }
        
        /*
        window.open(
        '/user/userboard/detail/1/notice',
        '_blank',
        'width=600,height=900,left=100,top=100'
        );
        */
    }

    return (
        <div className="relative inline-block">
            <button
                className="relative p-2"
                onClick={notificationIconClick}
                aria-label="알림 보기"
            >
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

                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-600 ring-2 ring-white" />
                )}
            </button>

            {isOpen && notifications.length > 0 && (
                <div className="notification-dropdown">
                    {notifications.map((n, index) => (
                        <div
                            key={index}
                            onClick={async () => {
                                console.log("알림 ID:", n.id);
                                try {
                                    await axios.post(`${APIConfig}/notification/${n.id}/read`, null, {
                                        headers: {
                                            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                                        },
                                    });

                                    const updated = notifications.map((item, i) =>
                                        i === index ? { ...item, isRead: true } : item
                                    );
                                    setNotifications(updated);
                                    notificationClick(updated);
                                } catch (e) {
                                    console.error("알림 읽음 처리 실패", e);
                                }
                            }}
                            style={{
                                padding: "10px",
                                backgroundColor: n.isRead ? "#919191ff" : "#ffffff",
                                cursor: "pointer",
                                borderBottom: "1px solid #ddd",
                                color: n.isRead ? "#e0e0e0ff" : "#000000"
                            }}
                        >
                            ■ <strong>{n.title}</strong>ㆍ<small>{n.writeDate}</small><br/>
                            <div>{n.message}</div>
                            <div>작성자 : {n.writer}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}