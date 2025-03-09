import { BrowserRouter, Routes, Route } from "react-router-dom";
import DataProvider from "./context/DataContext";
import LayoutGrid from "./components/LayoutGrid/LayoutGrid";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Chat from "./pages/Chat/Chat";
import Friends from "./pages/Friends/Friends";
import Nav from "./components/Nav/Nav";
import Dashboard from "./pages/Dashboard/Dashboard";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <LayoutGrid type='screen' />
        {/* <Nav /> */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 5000,
          }}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="friends" element={<Friends />} />
            <Route path="chat/:username" element={<Chat />} />
          </Route>

        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
