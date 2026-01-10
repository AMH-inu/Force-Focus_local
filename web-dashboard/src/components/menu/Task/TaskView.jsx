import React, { useState, useEffect, useRef } from 'react';
import './TaskView.css';
import useMainStore from '../../../MainStore.jsx';

// [수정] 기존 TrashIcon 컴포넌트 정의 삭제

export default function TaskView() {
  const { isDarkMode, isDirty, setIsDirty } = useMainStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  
  const fileInputRef = useRef(null);
  const [activeSelection, setActiveSelection] = useState({ sessionId: null, index: null });

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
      { id: 'coding', label: '코딩 작업', appPaths: ['Code.exe'], isCustom: false },
      { id: 'research', label: '자료 조사', appPaths: ['chrome.exe'], isCustom: false },
      { id: 'document', label: '문서 작성', appPaths: ['winword.exe'], isCustom: false },
      { id: 'presentation', label: '발표 자료 작성', appPaths: ['powerpnt.exe'], isCustom: false },
      { id: 'study', label: '학습 및 공부', appPaths: [], isCustom: false },
    ];
  });

  const markAsDirty = () => { if (!isDirty) setIsDirty(true); };

  const handleBrowseClick = (sessionId, index) => {
    setActiveSelection({ sessionId, index });
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && activeSelection.sessionId !== null) {
      const fileName = file.name;
      updatePathInput(activeSelection.sessionId, activeSelection.index, fileName);
    }
    e.target.value = '';
  };

  const handleSave = () => {
    const hasEmptyPath = sessions.some(session => 
      session.appPaths.some(path => path.trim() === "")
    );
    if (hasEmptyPath) {
      alert("입력되지 않은 프로그램이 있습니다. 모든 빈 칸을 완성해 주세요.");
      return;
    }
    localStorage.setItem('task-db-sessions', JSON.stringify(sessions));
    alert("설정된 프로그램 목록이 성공적으로 저장되었습니다.");
    setIsDirty(false);
  };

  const addPathInput = (sessionId) => {
    markAsDirty();
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
    markAsDirty();
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
      markAsDirty();
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
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".exe"
        onChange={handleFileChange}
      />

      <header className="task-header">
        <div className="header-text">
          <h2>🛠️ 작업 설정</h2>
          <p className="task-description">
            작업 설정에서는 작업별 강제 실행 프로그램 지정을 통해, 세션 시작 시 자동으로 프로그램을 실행 및 통제할 수 있습니다. (작업별 최대 5개까지 지정 가능)
          </p>
        </div>
        <div className="header-actions">
          <button className="add-task-btn" onClick={() => setIsModalOpen(true)}>+ 새 목록 추가</button>
          <button className="save-db-btn" onClick={handleSave}>저장하기</button>
        </div>
      </header>

      <div className="task-grid">
        {sessions.map((session) => (
          <div key={session.id} className="session-card">
            <div className="session-card-header">
              <div className="session-info">
                <span className="session-dot"></span>
                {session.label}
              </div>
              {session.isCustom && (
                <button className="delete-session-btn" onClick={() => handleDeleteSession(session.id)} title="전체 삭제">
                  {/* [수정] 휴지통 인라인 SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
              )}
            </div>
            
            <div className="card-divider"></div>

            <div className="path-input-list">
              <label className="section-label">실행 앱 리스트</label>
              {session.appPaths?.length > 0 ? (
                <div className="scrollable-path-area">
                  {session.appPaths.map((path, idx) => (
                    <div key={idx} className="path-input-row">
                      <div className="input-wrapper">
                        <input 
                          type="text" 
                          value={path} 
                          readOnly 
                          placeholder="프로그램 선택"
                        />
                        {/* 찾아보기 버튼 -> 인라인 아이콘 (...) */}
                        <button 
                          className="inline-browse-btn" 
                          onClick={() => handleBrowseClick(session.id, idx)}
                          title="찾아보기"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                        </button>
                      </div>
                      <button 
                        className="remove-path-btn-styled" 
                        onClick={() => removePathInput(session.id, idx)}
                        title="제거"
                      >
                        {/* 휴지통 인라인 SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-path-message">등록된 프로그램이 없습니다.</div>
              )}
            </div>

            <button 
              className="add-path-row-btn" 
              onClick={() => addPathInput(session.id)}
              disabled={session.appPaths.length >= 5}
            >
              {session.appPaths.length >= 5 ? "한도 초과 (최대 5개)" : "+ 프로그램 추가"}
            </button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>새 작업 추가</h3>
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