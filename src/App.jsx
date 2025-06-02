import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CheckpointPage from "./pages/CheckpointPage";

export default function App() {
return (
<Routes>
<Route path="/" element={<LoginPage />} />
<Route path="/cp" element={<CheckpointPage />} />
</Routes>
);
}