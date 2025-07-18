import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Journal from "./pages/Journal";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path="/Journal" element={<Journal />} />
    </Routes>
  );
}
