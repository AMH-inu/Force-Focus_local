import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }
  
  // -------- Test 코드 -----------------
  // 에러 발생 시 UI에 표시하기 위한 상태
  const [error, setError] = useState<string | null>(null);

  // 모든 프로세스 요약 정보 관련 상태
  const [processesSummary, setProcessesSummary] = useState<any[]>([]);
  const [processesError, setProcessesError] = useState<string | null>(null);
  


  // 1. 활성 창 정보 테스트 
  useEffect(() => {
    invoke('get_current_active_window_info')
      .then((res) => console.log('Active Window Info:', res))
      .catch((err) => console.error('Error:', err));
  }, []);

  // 2. 모든 프로세스 요약 정보 테스트
  useEffect(() => {
    invoke('get_all_processes_summary')
      .then((res) => {
        console.log('All Processes Summary:', res);
        setProcessesSummary(res as any);
      })
      .catch((err) => {
        console.error('Error getting all processes summary:', err);
        setProcessesError(err.toString());
      });
  }, []);

  // 3. 사용자 입력 빈도 통계 테스트 (주기적으로 업데이트)
  useEffect(() => {
    console.log('--- Testing get_input_frequency_stats (every 2 seconds) ---');
    const intervalId = setInterval(() => {
      invoke('get_input_frequency_stats')
        .then((res) => {
          console.log('Input Frequency Stats:', res);
          setError(null); // 성공 시 에러 초기화
        })
        .catch((err) => {
          console.error('Error getting Input Frequency Stats:', err);
          setError(`입력 빈도 통계 에러: ${err}`);
        });
    }, 2000); // 2초마다 갱신

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
  }, []); // 컴포넌트 마운트 시 한 번만 실행



  


  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
