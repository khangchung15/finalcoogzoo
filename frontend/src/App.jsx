import './App.css';
import Navbar from './components/Navbar';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Animals from './pages/animals';
import Exhibits from './pages/Exhibits';
import Tickets from './pages/Tickets';
import Membership from './pages/Membership';
import Events from './pages/events';
import Home from './pages/home';
import PrivateRoutes from './components/PrivateRoutes';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>

        <Route path='/' element={<Home />} />

        <Route path='/animals' element={<Animals />} />
        <Route path='/exhibits' element={<Exhibits />} />

        <Route element={<PrivateRoutes />}>
          <Route path='/tickets' element={<Tickets />} />
          <Route path='/membership' element={<Membership />} />
        </Route>

        <Route path='/events' element={<Events />} />
        <Route path='/login' element={<Login />} />

      </Routes>
    </Router>
  );
}

export default App;