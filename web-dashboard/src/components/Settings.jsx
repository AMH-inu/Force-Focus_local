import React from "react";
import "./Settings.css"

export default function Settings() {
  return (
    <div className="section-container settings">
      <h2 className="section-title">설정</h2>
      <p className="section-content">
        시스템 환경 설정을 관리합니다.  
        계정, 권한, 알림, 데이터 설정 등을 자유롭게 변경할 수 있습니다.
      </p>
    </div>
  );
}