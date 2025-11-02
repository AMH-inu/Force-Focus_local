import './App.css'
import TitleBar from './components/Titlebar.jsx'
import InfoBox from './components/InfoBox.jsx'
import MenuBar from './components/MenuBar.jsx'
import useMenuStore from './MenuStore.jsx'

function App() {
  const { activeMenu } = useMenuStore()
  
  return (
    <>
    {/* 1. 상단 제목 컴포넌트 */}
    <TitleBar
        onRefresh={() => location.reload()}
        onHelp={() => alert('도움말 페이지로 이동하도록 연결 예정입니다.')}
    />

    {/* 2. 좌측 메뉴 컴포넌트 */}
    <MenuBar />

    {/* 메뉴 컴포넌트 서식 지정 */}
    <main
        style={{
          marginLeft: '20%',              // 메뉴바 폭만큼 오른쪽으로 밀기
          paddingTop: '56px',             // 제목바 높이만큼 여백
          height: 'calc(100vh - 56px)',   // 남은 세로공간 꽉 채우기
          backgroundColor: '#f4f4f9',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
    ></main>

    {/* 3. 메뉴별 콘텐츠 (우측) */}
    <InfoBox />
    </>
  )
}

export default App
