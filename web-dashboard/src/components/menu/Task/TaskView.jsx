import React, { useState, useEffect } from 'react';
import './TaskView.css';
import useMainStore from '../../../MainStore.jsx';

export default function TaskView() {
  const { isDarkMode, isDirty, setIsDirty } = useMainStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('task-db-sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(s => ({
        ...s,
        appPaths: Array.isArray(s.appPaths) ? s.appPaths : []
      }));
    }
    return [
      { id: 'coding', label: '코딩 작업', appPaths: ['Code.exe', 'GitKraken.exe'], isCustom: false },
      { id: 'research', label: '자료 조사', appPaths: ['chrome.exe', 'Notion.exe'], isCustom: false },
      { id: 'document', label: '문서 작성', appPaths: ['winword.exe'], isCustom: false },
      { id: 'presentation', label: '발표 자료 작성', appPaths: ['powerpnt.exe'], isCustom: false },
      { id: 'study', label: '학습 및 공부', appPaths: [], isCustom: false },
    ];
  });

  // 데이터 변경 시 호출할 공통 함수
  const markAsDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  // [저장] 검증 로직
  const handleSave = () => {
    const hasEmptyPath = sessions.some(session => 
      session.appPaths.some(path => path.trim() === "")
    );

    if (hasEmptyPath) {
      alert("입력되지 않은 프로그램 경로가 있습니다. 모든 빈 칸을 완성해 주세요.");
      return;
    }

    localStorage.setItem('task-db-sessions', JSON.stringify(sessions));
    alert("설정된 프로그램 목록이 성공적으로 저장되었습니다.");
    setIsDirty(false); // 저장 완료 시 전역 플래그 해제
  };

  const addPathInput = (sessionId) => {
    markAsDirty(); // 변경 발생
    setSessions(sessions.map(s => {
      if (s.id === sessionId) {
        if ((s.appPaths || []).length >= 5) {
          alert("프로그램은 작업당 최대 5개까지만 추가할 수 있습니다.");
          return s;
        }
        return { ...s, appPaths: [...(s.appPaths || []), ''] };
      }
      return s;
    }));
  };

  const updatePathInput = (sessionId, index, value) => {
    markAsDirty(); // 변경 발생
    setSessions(sessions.map(s => {
      if (s.id === sessionId) {
        const newPaths = [...(s.appPaths || [])];
        newPaths[index] = value;
        return { ...s, appPaths: newPaths };
      }
      return s;
    }));
  };

  const removePathInput = (sessionId, index) => {
    markAsDirty();
    setSessions(sessions.map(s => {
      if (s.id === sessionId) {
        const newPaths = (s.appPaths || []).filter((_, i) => i !== index);
        return { ...s, appPaths: newPaths };
      }
      return s;
    }));
  };

  const handleAddSession = () => {
    if (!newSessionName.trim()) return;
    markAsDirty();
    setSessions([...sessions, { id: `custom_${Date.now()}`, label: newSessionName, appPaths: [''], isCustom: true }]);
    setNewSessionName('');
    setIsModalOpen(false);
  };

  const handleDeleteSession = (id) => {
    if (window.confirm("이 작업 유형을 삭제하시겠습니까?")) {
      markAsDirty(); // 변경 발생
      setSessions(sessions.filter(s => s.id !== id));
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <div className={`task-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <header className="task-header">
        <div className="header-text">
          <h2>🛠️ 작업 설정</h2>
          <p className="task-description">
            작업 설정에서는 작업별 강제 실행 프로그램 지정을 통해, 세션 시작 시 자동으로 프로그램을 실행 및 통제할 수 있습니다. (작업별 최대 5개까지 지정 가능)
          </p>
        </div>
        <div className="header-actions">
          <button className="add-task-btn" onClick={() => setIsModalOpen(true)}>+ 새 목록 추가</button>
          <button className="save-db-btn" onClick={handleSave}>저장</button>
        </div>
      </header>

      <div className="task-grid">
        {sessions.map((session) => (
          <div key={session.id} className="session-card">
            <div className="session-card-header">
              <div className="session-info">{session.label}</div>
              {session.isCustom && (
                <button className="delete-session-btn" onClick={() => handleDeleteSession(session.id)}>&times;</button>
              )}
            </div>

            {/* 작업 이름과 프로그램 목록 사이의 구분선 */}
            <div className="card-divider"></div>
            
            <div className="path-input-list">
                {session.appPaths?.length > 0 ? (
                    <>
                    <label>실행 앱 리스트</label>
                    <div className="scrollable-path-area">
                        {session.appPaths.map((path, idx) => (
                        <div key={idx} className="path-input-row">
                            <input 
                            type="text" 
                            value={path} 
                            onChange={(e) => updatePathInput(session.id, idx, e.target.value)}
                            placeholder="프로그램 이름 (예: Code.exe)"
                            />
                            <button className="remove-path-btn" onClick={() => removePathInput(session.id, idx)}>-</button>
                        </div>
                        ))}
                    </div>
                    </>
                ) : (
                    /* 프로그램이 하나도 없을 때 출력되는 안내 문구 */
                    <div className="empty-path-message">
                    강제 실행 프로그램을 추가해 주세요.
                    </div>
                )}
              </div>
              <button 
                className="add-path-row-btn" 
                onClick={() => addPathInput(session.id)}
                disabled={session.appPaths.length >= 5}
              >
                {session.appPaths.length >= 5 ? "한도 초과 (5개)" : "+ 프로그램 추가"}
              </button>
            </div>
        ))}
      </div>

    {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>새 작업 추가</h3>
              {/* 제목 바로 아래 다음 줄에 출력되도록 배치 */}
              <p>추가하고 싶은 작업 유형의 이름을 입력하세요.</p> 
            </div>
            <div className="modal-body">
              <div className="path-input-group">
                <label>작업 유형 명칭</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newSessionName} 
                  onChange={(e) => setNewSessionName(e.target.value)}
                  placeholder="예: 영상 편집"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={() => setIsModalOpen(false)}>취소</button>
              <button className="modal-confirm-btn" onClick={handleAddSession}>추가하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}