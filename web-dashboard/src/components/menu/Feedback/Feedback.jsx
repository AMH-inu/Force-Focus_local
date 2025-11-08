import React from "react";
import "./Feedback.css"

export default function Feedback() {
  return (
    <div className="feedback-container">
      {/* 상단 메뉴바 */}
      <div className="feedback-menu">
        <ul>
          <li>요약</li>
          <li>집중도</li>
          <li>피로도</li>
          <li>작업속도</li>
          <li>작업효율</li>
        </ul>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="feedback-content">
        <div className="feedback-section">
          <h3>피드백 요약</h3>
          <p>최근 사용자 피드백 요약 정보가 표시됩니다.</p>
        </div>

        <div className="feedback-section">
          <h3>집중도 피드백</h3>
          <p>집중도와 관련된 AI 기반 피드백을 표시합니다.</p>
        </div>

        <div className="feedback-section">
          <h3>피로도 피드백</h3>
          <p>피로도와 관련된 AI 기반 피드백을 표시합니다.</p>
        </div>
      </div>
    </div>
  );
}