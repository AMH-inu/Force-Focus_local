import React, { useState } from 'react';
import { styles } from './SettingsView.styles';

interface SettingsViewProps {
  userEmail: string | null;
  onLogout: () => void;
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ userEmail, onLogout, onBack }) => {
  // 자동 시작 상태 (추후 Rust 플러그인과 연동 예정)
  const [autoStartEnabled, setAutoStartEnabled] = useState(false);

  const handleAutoStartToggle = async () => {
    // TODO: tauri-plugin-autostart 연동
    const newState = !autoStartEnabled;
    setAutoStartEnabled(newState);
    console.log(`Auto-start toggled: ${newState}`);
  };

  // 오프라인/온라인 색상 결정
  const statusColor = userEmail ? '#4ade80' : '#9ca3af';

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← 뒤로
        </button>
        <h1 style={styles.title}>설정</h1>
        <div style={{ width: '40px' }}></div> {/* 레이아웃 균형용 공백 */}
      </div>

      <div style={styles.content}>
        {/* 1. 사용자 프로필 섹션 */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>계정 정보</h2>
          <div style={styles.profileCard}>
            <div style={styles.avatar}>
              {userEmail ? userEmail[0].toUpperCase() : 'G'}
            </div>
            <div style={styles.userInfo}>
              <div style={styles.email}>{userEmail || 'Guest User'}</div>
              <div style={{...styles.status, color: statusColor}}>
                <span style={{...styles.statusDot, backgroundColor: statusColor}}></span>
                {userEmail ? 'Online' : 'Offline Mode'}
              </div>
            </div>
          </div>
        </div>

        {/* 2. 일반 설정 섹션 */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>일반</h2>
          
          {/* 자동 시작 토글 */}
          <div style={styles.settingItem}>
            <div>
              <div style={styles.settingLabel}>Windows 시작 시 자동 실행</div>
              <div style={styles.settingDesc}>컴퓨터를 켤 때 Force-Focus를 백그라운드에서 실행합니다.</div>
            </div>
            <button 
              onClick={handleAutoStartToggle}
              style={{
                ...styles.toggleButton,
                backgroundColor: autoStartEnabled ? '#4ade80' : '#374151',
                justifyContent: autoStartEnabled ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={styles.toggleHandle}></div>
            </button>
          </div>
        </div>

        {/* 3. 앱 정보 및 로그아웃 */}
        <div style={styles.footerSection}>
          <div style={styles.versionInfo}>Version 0.1.0</div>
          
          <button 
            onClick={onLogout}
            style={styles.logoutButton}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            {userEmail ? '로그아웃' : '나가기 (초기화)'}
          </button>
        </div>
      </div>
    </div>
  );
};



export default SettingsView;