import './App.css';
import Navbar from './components/Navbar';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Animals from './pages/Animals';
import Exhibits from './pages/Exhibits';
import Tickets from './pages/Tickets';
import Membership from './pages/Membership';
import Events from './pages/Membership';
import Contact from './pages/Contact';
import PrivateRoutes from './components/PrivateRoutes';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>

        {/* Define the content for the homepage inline here */}
      

        <Route path='/animals' element={<Animals />} />
        <Route path='/exhibits' element={<Exhibits />} />

        <Route element={<PrivateRoutes />}>
          <Route path='/tickets' element={<Tickets />} />
          <Route path='/membership' element={<Membership />} />
        </Route>

        <Route path='/events' element={<Events />} />
        <Route path='/contact' element={<Contact />} />

        <Route path='/login' element={<LoginPage />} />

      </Routes>
    </Router>
  );
}

export default App;