import './App.css';
import Sidepanel from './components/Sidepanel';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="App flex">
      <Sidepanel />
      <AppRoutes />
    </div>
  );
}

export default App;
