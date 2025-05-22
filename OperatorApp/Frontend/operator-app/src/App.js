import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Authentication/login';
import Register from './Components/Authentication/register';
import Navbar from './Components/Navbar';
import OperatorStation from './Components/Station_page/ChargingStationDashboard';
import './App.css';

function App() {
  return (
  
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/operator" element={<OperatorStation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;