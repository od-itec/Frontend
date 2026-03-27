import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/LoginPage";
import WorkspaceLayout from "./components/WorkspaceLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/workspace" element={<WorkspaceLayout />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;