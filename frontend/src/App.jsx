import './App.css';
import Navbar from './components/Navbar';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import Animals from './pages/Animals';
import Exhibits from './pages/Exhibits';
import Tickets from './pages/Tickets';
import Membership from './pages/Membership';
import Events from './pages/events';
import Home from './pages/home';
import PrivateRoutes from './components/PrivateRoutes';
import { AuthProvider } from './components/AuthContext'

function App() {
  return (
    <AuthProvider>
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
<<<<<<< HEAD
        <Route path='/contact' element={<Contact />} />

        <Route path='/login' element={<LoginPage />} />
=======
        <Route path='/login' element={<Login />} />
>>>>>>> daaf172c64ff215f04b8dc6a5e5bef27c7fd8efc

      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;