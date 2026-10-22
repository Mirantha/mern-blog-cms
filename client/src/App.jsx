import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PostDetail from "./pages/PostDetail";
import PostEditor from "./pages/PostEditor";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:slug" element={<PostDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<ProtectedRoute roles={["editor", "admin"]} />}>
            <Route path="/editor/new" element={<PostEditor />} />
            <Route path="/editor/:slug" element={<PostEditor />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}