import './App.css';
import Navbar from './components/Navbar';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Animal from './pages/animals';
import Exhibits from './pages/Exhibits';
import Tickets from './pages/Tickets';
import Account from './pages/account';
import EmployeeDash from './pages/employeedash';
import Membership from './pages/Membership';
import Events from './pages/events';
import PrivateRoutes from './components/PrivateRoutes';
import Home from './pages/home';
import { AuthProvider } from './components/AuthContext';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Navbar />
      <Routes>  

        <Route path='/' element={<Home/>} />

        <Route path='/animals' element={<Animal />} />
        <Route path='/exhibits' element={<Exhibits />} />

        <Route element={<PrivateRoutes />}>
          <Route path='/tickets' element={<Tickets />} />
          <Route path='/membership' element={<Membership />} />
          <Route path='/account' element={<Account/>} />
        </Route>

        <Route path='/events' element={<Events />} />

        <Route path='/login' element={<LoginPage />} />

        <Route path='/employee-dashboard' element={<EmployeeDash/>} />

      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;