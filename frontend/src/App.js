import { Navigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

import AppBar from './components/AppBar'
import SideBar from "./components/SideBar"
import Login from './pages/Authentication/Login'
import Setting from './pages/Authentication/Setting'
import Register from './pages/Authentication/Register'

import Test from './Test'
import Chat from './pages/Chat/Chat'
import Home from './pages/Home'
import Page404 from './pages/Page404'
import Profile from './pages/Profile'

import Category from './pages/Category'
import Product from './pages/Product/Product'
import UpProduct from './pages/Product/UpProduct'
import DelProduct from './pages/Product/DelProduct'
import AddProduct from './pages/Product/AddProduct'


function App() {
  return (
    <Routes>
      <Route path="/test" element={<Test />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/" element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="setting" element={<Setting />} />
      <Route path="register" element={<Register />} />

      <Route path="category/:slug" element={<Category />} />
      <Route path="dog" element={<SideBar />} />

      <Route path="product/:slug" element={<Product />} />
      <Route path="product/add" element={<AddProduct />} />
      <Route path="product/update/:slug" element={<UpProduct />} />
      <Route path="product/delete/:slug" element={<DelProduct />} />
      {/* <Route path="product/update/:slug" element={<UpdateProduct />} /> */}

      <Route path="profile/:slug" element={<Profile />} />

      <Route path="404" element={<Page404 />} />
      <Route path="appbar" element={<AppBar />} />
      <Route path="temp" element={<Navigate to="/" />} />

    </Routes>
  );
}

export default App;
