import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            localStorage.setItem('accessToken', 'test-token-12345');
            setIsLoading(false);
            onLoginSuccess();
        }, 1000);
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Dashboard Login</h2>
                
                {/* 각 요소를 한 줄씩 차지하도록 구조화 */}
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        name="username"
                        value={credentials.username}
                        onChange={handleChange}
                        required
                        placeholder="아이디를 입력하세요"
                    />
                </div>
                
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        placeholder="비밀번호를 입력하세요"
                    />
                </div>

                <button type="submit" className={`login-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                    {isLoading ? <div className="spinner"></div> : '로그인'}
                </button>

                <div className="divider-container">
                    <span className="divider-line"></span>
                    <span className="divider-text">OR</span>
                    <span className="divider-line"></span>
                </div>

                {/* 구글 로그인 버튼 추가 */}
                <button type="button" className="google-btn" onClick={() => alert('구글 로그인 기능 준비 중입니다.')}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
                    Google로 로그인하기
                </button>

                <div className="login-footer">
                    <a href="#find">비밀번호 찾기</a>
                    <span className="footer-divider">|</span>
                    <a href="#signup">회원가입</a>
                </div>
            </form>
        </div>
    );
};

export default Login;