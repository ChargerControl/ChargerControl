import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Authentication/login';
import Register from './Components/Authentication/register';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <header className="App-header">
              <p>Welcome to ChargerControl</p>
            </header>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
