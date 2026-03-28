import { Routes, Route } from 'react-router-dom';
import LobbyPage from './routes/LobbyPage';
import GamePage from './routes/GamePage';
import RevealPage from './routes/RevealPage';

/**
 * 应用根组件，负责路由配置
 * 注意：这里不再包裹 <Router>，因为它已经在 main.tsx 中定义过了
 */
function App() {
  return (
    <Routes>
      {/* 1. 根路径显示大厅页面 */}
      <Route path="/" element={<LobbyPage />} />

      {/* 2. 游戏进行页面 */}
      <Route path="/game/:puzzleId" element={<GamePage />} />

      {/* 3. 故事揭晓页面 */}
      <Route path="/reveal/:sessionId" element={<RevealPage />} />
    </Routes>
  );
}

export default App;