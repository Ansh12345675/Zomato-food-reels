import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Reels from '../components/Reels'
import FoodPartnerLogin from '../pages/auth/FoodPartner_login'
import FoodPartnerRegister from '../pages/auth/FoodPartnerRegister'
import UserLogin from '../pages/auth/userLogin'
import UserRegister from '../pages/auth/UserRegister'
import Home from '../pages/auth/general/Home';
import Saves from '../pages/auth/general/Saves';
import CreateFood from '../pages/auth/food-partner/CreateFood';
import Profile from '../pages/auth/food-partner/Profile';
import Store from '../pages/auth/general/Store';
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/saved" element={<Saves />} />
        <Route path="/store/:partnerId" element={<Store />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route
          path="/food-partner/register"
          element={<FoodPartnerRegister />}
        />
        <Route
          path="/food-partner/login"
          element={<FoodPartnerLogin />}
        />
        <Route path="/create-food" element={<CreateFood />} />
        <Route path="/food-partner/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes