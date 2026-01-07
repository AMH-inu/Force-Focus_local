import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import './login.css';
import useMainStore from '../../MainStore.jsx';
import logoIcon from '../layout/TitleBar/ForceFocus_icon.png'; 

const Login = ({ onLoginSuccess }) => {
    const isDarkMode = useMainStore((state) => state.isDarkMode);
    
    const handleGoogleSuccess = (credentialResponse) => {
        localStorage.setItem('accessToken', credentialResponse.credential);
        onLoginSuccess();
    };

    const handleGoogleError = () => {
        alert("구글 로그인에 실패했습니다. 다시 시도해 주세요.");
    };

    return (
        <div className={`login-container ${isDarkMode ? 'dark-theme' : ''}`}>
            <div className="login-wrapper"> {/* 두 카드를 세로로 정렬할 래퍼 */}
                
                {/* 첫 번째 행: 브랜드 카드 */}
                <div className="brand-card">
                    <img src={logoIcon} alt="ForceFocus Logo" className="login-brand-logo" />
                    <h1 className="brand-name"><br></br>Force-Focus <br></br> Web Dashboard</h1>
                </div>

                {/* 두 번째 행: 로그인 폼 카드 */}
                <div className="login-form-card">
                    <div className="login-header">
                        <h2>Dashboard Login</h2>
                        <p className="login-subtitle">서비스 이용을 위해 Google 계정으로 로그인해 주세요.</p>
                    </div>

                    <div className="google-login-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme={isDarkMode ? "filled_black" : "outline"}
                            shape="pill"
                            size="large"
                            width="360px"
                            useOneTap
                        />
                    </div>

                    <div className="login-footer">
                        <p className="security-notice">
                            안전한 로그인을 위해 Google OAuth 2.0 시스템을 사용합니다.
                        </p>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default Login;