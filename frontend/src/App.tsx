import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Community } from './pages/Community';
import { Market } from './pages/Market';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/community" element={<Community />} />
            <Route path="/market" element={<Market />} />
            <Route path="/profile/:username" element={<Profile />} />
            {/* Outras rotas serão adicionadas aqui */}
            <Route path="*" element={
              <div className="container">
                <h1 className="title-xl">Em Breve</h1>
                <p className="text-secondary mt-4">Esta página está em desenvolvimento.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
