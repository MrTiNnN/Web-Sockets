import { BrowserRouter, Routes, Route } from "react-router-dom";
import DataProvider from "./context/DataContext";
import LayoutGrid from "./components/LayoutGrid/LayoutGrid";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Chat from "./pages/Chat/Chat";
import Friends from "./pages/Friends/Friends";
import Nav from "./components/Nav/Nav";

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <LayoutGrid type='screen' />
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat/:username" element={<Chat />} />
          <Route path="/friends" element={<Friends />} />
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
