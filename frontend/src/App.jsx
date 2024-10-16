import './App.css';
import Navbar from './components/Navbar';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Animals from './pages/Animals';
import Home from './pages/Home';
import Exhibits from './pages/Exhibits';
import Tickets from './pages/Tickets';
import Membership from './pages/Membership';
import Events from './pages/Events';
import ContactUs from './pages/ContactUs';
import PrivateRoutes from './components/PrivateRoutes';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>  

        <Route path='/' Component={Home}/>
        <Route path='/animals' Component={Animals}/>
        <Route path='/exhibits' Component={Exhibits}/>

        <Route element={<PrivateRoutes/>}>

          <Route path='/tickets' Component={Tickets}/>
          <Route path='/membership' Component={Membership}/>

        </Route>

        <Route path='/events' Component={Events}/>
        <Route path='/contact' Component={ContactUs}/>
        <Route path='/login' Component={LoginPage}/> 

      </Routes>
    </Router>
  );
}

export default App;