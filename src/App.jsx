import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Marketplace from "./pages/Marketplace";
import LoginPage from "./pages/LoginPage";
import AdminPanel from "./components/AdminPanel";
import { useSocket } from "./hooks/useSocket";
import { useDrops } from "./hooks/useDrops";
import { isAdmin, loadUser, saveUser, clearUser } from "./lib/auth";

function App() {
  const [user, setUser] = useState(loadUser);
  const { socket, connected } = useSocket();
  const { drops, loading, error } = useDrops(socket);

  const handleUserSet = (userData) => {
    setUser(userData);
    saveUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    clearUser();
  };

  return (
    <Router>
      <Layout user={user} connected={connected} onLogout={handleLogout}>
        <Routes>
          <Route
            path="/"
            element={
              <Marketplace
                drops={drops}
                loading={loading}
                error={error}
                user={user}
              />
            }
          />
          <Route
            path="/login"
            element={<LoginPage onUserSet={handleUserSet} user={user} />}
          />
          <Route
            path="/admin"
            element={
              isAdmin(user) ? <AdminPanel /> : <Navigate to="/" />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
