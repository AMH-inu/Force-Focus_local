// 파일 위치: Force-Focus/desktop-agent/src/components/LoginView.tsx

import { useState, FC, FormEvent, ChangeEvent } from 'react';

// Props 인터페이스 정의
interface LoginViewProps {
  onLoginSuccess: () => void;
}

const LoginView: FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    // --- Mock 로그인 로직 ---
    if (email && password) { // 이메일과 비밀번호가 입력되면 성공으로 가정
      onLoginSuccess();
      setError(''); // 성공 시 에러 초기화
    } else {
      setError('이메일과 비밀번호를 입력해주세요.');
    }
    // --- Mock 로그인 로직 끝 ---
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Force-Focus</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">로그인</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">
              이메일
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              placeholder="name@example.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              placeholder="********"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs italic">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg w-full focus:outline-none focus:shadow-outline transition duration-200"
          >
            로그인
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <a href="#" className="text-blue-400 hover:text-blue-300 mr-4">비밀번호 찾기</a>
          <a href="https://your-webapp-dashboard.com/signup" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">회원가입</a>
        </div>
      </div>
    </div>
  );
};

export default LoginView;