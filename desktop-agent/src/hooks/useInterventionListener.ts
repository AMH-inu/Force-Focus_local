import { useState, useEffect } from 'react';
import { listen, Event } from '@tauri-apps/api/event';
import { invoke } from "@tauri-apps/api/core";

import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

// Rust에서 오는 페이로드 타입
type InterventionPayload = "notification" | "overlay";

/**
 * Rust 백엔드의 'intervention-trigger' 이벤트를 수신하고,
 * OS 알림 또는 오버레이 상태를 관리하는 커스텀 훅.
 */
export function useInterventionListener() {
  // 오버레이 표시 여부 상태
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  // 백엔드 통신 에러 상태
  const [backendError, setBackendError] = useState<string | null>(null);

  /**
   * OS 레벨의 알림을 전송하는 함수
   */
  const sendOsNotification = async () => {
    try {
      // 1. 권한 확인
      let permissionGranted = await isPermissionGranted();
      
      // 2. 권한이 없으면 요청
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }

      // 3. 권한이 있으면 알림 전송
      if (permissionGranted) {
        sendNotification({
          title: '집중할 시간입니다!',
          body: '현재 활동이 "딴짓"으로 감지되었습니다.',
          // (추가) 아이콘 등 설정 가능
        });
      } else {
        console.warn('OS notification permission denied.');
      }
    } catch (e) {
      console.error("Failed to send OS notification:", e);
      setBackendError(`OS 알림 전송 실패: ${e}`);
    }
  };

  // Rust 이벤트 리스너 설정
  useEffect(() => {
    console.log("Setting up Rust event listener...");
    let unlistenFn: (() => void) | null = null;

    const setupListener = async () => {
      try {
        const unlisten = await listen<InterventionPayload>("intervention-trigger", (event) => {
          console.log(`Rust Event Received: ${event.payload}`);
          
          if (event.payload === "overlay") {
            // "강한 개입" 시 오버레이 표시
            setShowOverlay(true);
          } else if (event.payload === "notification") {
            // "약한 개입" 시 OS 알림 전송
            sendOsNotification();
          }
        });
        unlistenFn = unlisten;
      } catch (e) {
        console.error("Failed to setup Rust listener:", e);
        setBackendError(`이벤트 리스너 설정 실패: ${e}`);
      }
    };

    setupListener();

    return () => {
      console.log("Cleaning up Rust event listener...");
      if (unlistenFn) unlistenFn();
    };
  }, []); // 마운트 시 1회 실행

  // "이건 업무임" 피드백 핸들러
  const handleInterventionFeedback = async () => {
    console.log("Feedback button clicked. Invoking 'submit_feedback'...");
    try {
      await invoke('submit_feedback', { feedbackType: 'is_work' });
      console.log("Feedback submitted successfully.");
      setBackendError(null); 
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setBackendError(`피드백 전송 실패: ${error}`);
    } finally {
      setShowOverlay(false); // 오버레이 닫기
    }
  };

  // "닫기" 핸들러
  const handleCloseOverlay = () => {
    console.log("Close button clicked. Hiding overlay.");
    setShowOverlay(false);
  };

  // 훅이 App.tsx에 제공할 값과 함수들
  return { 
    showOverlay, 
    backendError, 
    handleInterventionFeedback, 
    handleCloseOverlay 
  };
}