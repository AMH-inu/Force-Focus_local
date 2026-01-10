import React, { useState } from "react";
import "./Settings.css";
import useMainStore from "../../../MainStore"; // MainStore 경로에 맞춰 수정 필요

// 설정(Settings) 컴포넌트
const Settings = () => {
  // MainStore에서 상태와 액션 불러오기
  const { settingsViewMode, setSettingsViewMode } = useMainStore();
  const [popup, setPopup] = useState(null); // 팝업은 개별 컴포넌트 내 상태로 유지

  // 팝업 열기 / 닫기 함수
  const openPopup = (id) => setPopup(id);
  const closePopup = () => setPopup(null);

  // 팝업 내용 정의
  const renderPopup = () => {
    if (!popup) return null;

    let title = "";
    let content = "";

    switch (popup) {
      case "manual": title = "직접 선택"; content = "추후 추가 예정입니다."; break;
      case "preset": title = "예시 프로그램 중 선택"; content = "추후 추가 예정입니다."; break;
      case "recommend": title = "자동 선택"; content = "추후 추가 예정입니다."; break;
      case "summary": title = "제한 프로그램 요약"; content = "추후 추가 예정입니다."; break;
      case "alert_push": title = "데스크탑 알림 설정"; content = "추후 추가 예정입니다."; break;
      case "alert_email": title = "이메일 알림 설정"; content = "추후 추가 예정입니다."; break;
      case "account_info": title = "계정 정보"; content = "추후 추가 예정입니다."; break;
      case "account_password": title = "비밀번호 변경"; content = "추후 추가 예정입니다."; break;
      default: return null;
    }

    return (
      <div className="popup-overlay" onClick={closePopup}>
        <div className="popup-box" onClick={(e) => e.stopPropagation()}>
          <div className="popup-header">
            <h2>{title}</h2>
            <button className="popup-close-icon" onClick={closePopup} aria-label="닫기">
              &times;
            </button>
          </div>
          <div className="popup-body">
            <p>{content}</p>
          </div>
        </div>
      </div>
    );
  };

  // 오른쪽 콘텐츠 렌더링 (settingsViewMode 사용)
  const renderContent = () => {
    switch (settingsViewMode) {
      case "limit":
        return (
          <div className="settings-content" key="limit">
            <div className="settings-header">
              <h2>제한 프로그램 설정</h2>
            </div>
            <div className="settings-divider"></div>
            
            <div className="settings-item">
              <h3>직접 선택</h3>
              <p>사용자가 제한할 프로그램을 로컬에서 직접 선택할 수 있습니다.</p>
              <button className="arrow-btn" onClick={() => openPopup("manual")}>
                <span>→</span>
              </button>
            </div>

            <div className="settings-item">
              <h3>예시 프로그램 중 선택</h3>
              <p>미리 정의된 예시 목록에서 제한할 프로그램을 선택할 수 있습니다.</p>
              <button className="arrow-btn" onClick={() => openPopup("preset")}>
                <span>→</span>
              </button>
            </div>

            <div className="settings-item">
              <h3>자동 선택</h3>
              <p>AI 기반으로 추천된 사용자 맞춤형 제한 프로그램을 적용할 수 있습니다.</p>
              <button className="arrow-btn" onClick={() => openPopup("recommend")}>
                <span>→</span>
              </button>
            </div>

            <div className="settings-item">
              <h3>제한 프로그램 요약</h3>
              <p>선택된 프로그램과 제한 시간 정보를 확인할 수 있습니다.</p>
              <button className="arrow-btn" onClick={() => openPopup("summary")}>
                <span>→</span>
              </button>
            </div>
          </div>
        );

      case "alert":
        return (
          <div className="settings-content" key="alert">
            <div className="settings-header">
              <h2>알림 설정</h2>
            </div>
            <div className="settings-divider"></div>

            <div className="settings-item">
              <h3>데스크탑 알림</h3>
              <p>데스크탑 앱을 통한 알림 수신 여부 등을 설정할 수 있습니다.</p>
              <button className="arrow-btn" onClick={() => openPopup("alert_push")}>
                <span>→</span>
              </button>
            </div>

            <div className="settings-item">
              <h3>이메일 알림</h3>
              <p>필요 시 메일로 알림을 받을지 여부를 선택할 수 있습니다.</p>
              <button className="arrow-btn" onClick={() => openPopup("alert_email")}>
                <span>→</span>
              </button>
            </div>
          </div>
        );

      case "account":
        return (
          <div className="settings-content" key="account">
            <div className="settings-header">
              <h2>계정 관리</h2>
            </div>
            <div className="settings-divider"></div>

            <div className="settings-item">
              <h3>계정 정보</h3>
              <p>현재 로그인된 사용자 정보 및 보안 설정을 확인합니다.</p>
              <button className="arrow-btn" onClick={() => openPopup("account_info")}>
                <span>→</span>
              </button>
            </div>

            <div className="settings-item">
              <h3>비밀번호 변경</h3>
              <p>비밀번호를 변경하고 재설정할 수 있습니다.</p>
              <button className="arrow-btn" onClick={() => openPopup("account_password")}>
                <span>→</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-layout">
      {/* 왼쪽 메뉴 */}
      <aside className="side-menu">
        <ul>
          <li
            className={settingsViewMode === "limit" ? "active" : ""}
            onClick={() => setSettingsViewMode("limit")}
          >
            제한 프로그램 설정
          </li>
          <li
            className={settingsViewMode === "alert" ? "active" : ""}
            onClick={() => setSettingsViewMode("alert")}
          >
            알림 설정
          </li>
          <li
            className={settingsViewMode === "account" ? "active" : ""}
            onClick={() => setSettingsViewMode("account")}
          >
            계정 관리
          </li>
        </ul>
      </aside>

      {/* 오른쪽 콘텐츠 */}
      <main className="main-content">
        {renderContent()}
        {renderPopup()}
      </main>
    </div>
  );
};

export default Settings;