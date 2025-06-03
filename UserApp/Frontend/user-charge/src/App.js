import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/Authentication/login';
import Register from './Components/Authentication/register';
import UserProfile from './Components/User_Profile/User_Page';
import Navbar from './Components/Navbar';
import Map from './Components/Charger_Location/ChargerMap';
import Booking from './Components/Booking/ChargerMap';
import Home from './Components/Home/Home';
import './App.css';

function App() {
  return (
    <><Navbar /><Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/charging_locations" element={<Map />} />
          <Route path="/charging_booking" element={<Booking />} />
          <Route path="/" element={<Home/>}/>
        </Routes>
      </div>
    </Router></>
  );
}

export default App;
