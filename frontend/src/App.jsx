import './App.css';
import Navbar from './components/Navbar';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import animals from './pages/animals';
import home from './pages/home';
import exhibits from './pages/Exhibits';
import tickets from './pages/Tickets';
import membership from './pages/Membership';
import events from './pages/events';
import contactus from './pages/contactus';
import PrivateRoutes from './components/PrivateRoutes';
import { AuthProvider } from './components/AuthContext'

function App() {
  return (
    <AuthProvider>
    <Router>
      <Navbar />
      <Routes>  

        <Route path='/' Component={home}/>
        <Route path='/animals' Component={animals}/>
        <Route path='/exhibits' Component={exhibits}/>

        <Route element={<PrivateRoutes/>}>

          <Route path='/tickets' Component={tickets}/>
          <Route path='/membership' Component={membership}/>

        </Route>

        <Route path='/events' Component={events}/>
        <Route path='/contact' Component={contactus}/>

        <Route path='/login' Component={LoginPage}/>

      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;