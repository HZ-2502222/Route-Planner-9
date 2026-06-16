import { useState } from 'react';
import StartPage from './components/StartPage';
import Dashboard from './components/Dashboard';

//Main App component - manages page state and navigation
function App() {
  //Store uploaded shuttle and passenger data
  const [data, setData] = useState(null);

  //If data is loaded, show dashboard; otherwise show start page
  if (data) {
    return <Dashboard data={data} setData={setData} onReset={() => setData(null)} />;
  }

  return <StartPage onDataReady={setData} />;
}

export default App;
