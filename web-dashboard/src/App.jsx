import './App.css'
import TitleBar from './components/layout/TitleBar/TitleBar.jsx'
import InfoBox from './components/layout/InfoBox/InfoBox.jsx'
import MenuBar from './components/layout/MenuBar/MenuBar.jsx'
import useMainStore from './MainStore.jsx'

function App() {
  const { activeMenu } = useMainStore()
  
  return (
    <>
    {/* 1. 상단 제목 바 컴포넌트 */}
    <TitleBar
        onRefresh={() => location.reload()}
        onHelp={() => alert('도움말 페이지로 이동하도록 연결 예정입니다.')}
    />

    {/* 2. 좌측 메뉴 바 컴포넌트 */}
    <MenuBar />

    {/* 메뉴 컴포넌트 서식 지정 */}
    <main
        style={{
          marginLeft: '20%',
          paddingTop: '56px',
          height: 'calc(100vh - 56px)',
          backgroundColor: '#f4f4f9',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
    ></main>

    {/* 3. 메뉴별 표시 영역 */}
    <InfoBox />
    </>
  )
}

export default App
