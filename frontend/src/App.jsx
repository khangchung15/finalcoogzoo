import './App.css';
import Navbar from './components/Navbar';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Animals from './pages/Animals';
import Exhibits from './pages/Exhibits';
import Tickets from './pages/Tickets';
import Membership from './pages/Membership';
import Events from './pages/Events';
import Home from './pages/Home';
import PrivateRoutes from './components/PrivateRoutes';

function App() {
  return (
    <Router basename="/coog-zoo">
      <Navbar />
      <Routes>

        <Route path='/' element={<Home />} />  {/* This will now be /coog-zoo/ */}

        <Route path='/animals' element={<Animals />} />  {/* /coog-zoo/animals */}
        <Route path='/exhibits' element={<Exhibits />} />  {/* /coog-zoo/exhibits */}

        <Route element={<PrivateRoutes />}>
          <Route path='/tickets' element={<Tickets />} />  {/* /coog-zoo/tickets */}
          <Route path='/membership' element={<Membership />} />  {/* /coog-zoo/membership */}
        </Route>

        <Route path='/events' element={<Events />} />  {/* /coog-zoo/events */}
        <Route path='/login' element={<Login />} />  {/* /coog-zoo/login */}

      </Routes>
    </Router>
  );
}

export default App;