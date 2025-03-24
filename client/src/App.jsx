import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Home from "./pages/Home"; 

const App = () => {
  return (
    
      <Router>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manager/*" element={<DashboardLayout />} />
        </Routes>
      </Router>
   
  );
};

export default App;
