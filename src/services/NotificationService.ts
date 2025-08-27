import APIConfig from "../configs/API.config";
import {getAuthToken} from "./TokenManagementService";

export interface notificationInfo1 {
    id: number,
    boardid: number,
    title: string,
    writeDate: string,
    message: string,
    writer: string,
    isRead: boolean
}

export async function getNotificationData(): Promise<notificationInfo1> {

  const token = getAuthToken();
  const response = await fetch(`${APIConfig}/notification/lnit`, 
                    { method: "GET", 
                      headers: {Authorization: `Bearer ${token}`},
                      credentials: "include"}          
                  );
  
  if (!response.ok){
    console.error(response.statusText);
    throw new Error("조회 실패");
  }

  return await response.json();
}