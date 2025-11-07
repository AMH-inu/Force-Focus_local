// 파일 위치: Force-Focus/desktop-agent/src/components/MainView/SessionDisplay.tsx

import { FC, useState, useEffect } from 'react';
import { Session, Task } from '../../types'; 

// Props 인터페이스 정의
interface SessionDisplayProps {
  session: Session | null; // 현재 활성 세션 정보
  task: Task | null;     // 현재 세션에 연결된 Task 정보
}

const SessionDisplay: FC<SessionDisplayProps> = ({ session, task }) => {
  const [remainingTime, setRemainingTime] = useState<string>("00:00");

  useEffect(() => {
    let timer: NodeJS.Timeout; // 타이머 ID를 저장할 변수

    // 남은 시간을 계산하고 상태를 업데이트하는 함수
    const calculateRemainingTime = () => {
      if (!session || session.status !== 'active') {
        setRemainingTime("00:00");
        return;
      }

      const startTime = new Date(session.start_time).getTime(); // 세션 시작 시간 (밀리초)
      const goalDurationMs = session.goal_duration * 60 * 1000; // 목표 시간을 밀리초로 변환
      const elapsedMs = Date.now() - startTime; // 경과 시간 (밀리초)
      const remainingMs = goalDurationMs - elapsedMs; // 남은 시간 (밀리초)

      if (remainingMs <= 0) {
        setRemainingTime("00:00"); // 남은 시간이 없으면 00:00 표시
        clearInterval(timer); // 타이머 종료
        return;
      }

      const totalSeconds = Math.floor(remainingMs / 1000); // 전체 남은 초
      const minutes = Math.floor(totalSeconds / 60);       // 남은 분
      const seconds = totalSeconds % 60;                   // 남은 초

      // "MM:SS" 형식으로 포맷하여 상태 업데이트
      setRemainingTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    // 세션이 활성 상태일 때만 타이머 시작
    if (session && session.status === 'active') {
      calculateRemainingTime(); // 컴포넌트 마운트/세션 변경 시 즉시 한 번 계산
      timer = setInterval(calculateRemainingTime, 1000); // 1초마다 업데이트
    } else {
      setRemainingTime("00:00"); // 세션이 활성 상태가 아니면 타이머 초기화
    }

    // 컴포넌트 언마운트 또는 세션 변경 시 타이머 정리
    return () => clearInterval(timer);
  }, [session]); // session Props가 변경될 때마다 useEffect 재실행

  return (
    <div className="flex flex-col items-center flex-grow justify-center">
      {/* 세션 상태 표시 */}
      <p className="text-xl text-gray-400 mb-2">
        {session?.status === 'active' ? '집중 세션 진행 중' : '휴식 중'}
      </p>
      {/* 현재 Task 이름 표시 */}
      <h2 className="text-5xl font-extrabold mb-4">
        {task?.task_name || "진행 중인 Task 없음"} {/* Task가 없으면 기본 메시지 */}
      </h2>
      {/* 남은 시간 타이머 표시 */}
      <p className="text-6xl font-mono mb-8 text-blue-400">
        {remainingTime}
      </p>
    </div>
  );
};

export default SessionDisplay;