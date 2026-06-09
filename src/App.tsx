import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UsersList from "./pages/users/UsersList";
import UserDetails from "./pages/users/UserDetails";
import Login from "./pages/auth/Login";
import PrivateRoute from "./components/PrivateRoute";
import ProductList from "./pages/products/ProductList";
import Categories from "./pages/categories/Categories";
import "react-toastify/dist/ReactToastify.css";
import Settings from "./pages/settings/Settings";
import ForgotPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Unauthorized from "./components/Unauthorized";
import Dashboard from "./pages/dashboard/Dashboard";
import WordList from "./pages/words/WordList";
import WordDetail from "./pages/words/WordDetail";
import QuizList from "./pages/quiz/QuizList";
import ForumApproval from "./pages/forum/ForumApproval";
import TopicDetail from "./pages/forum/TopicDetail";
function App() {
  const { adminUserInfo } = useSelector((state: any) => state.auth);

  return (
    <Routes>
      {/* Root route redirects based on login status */}
      <Route
        path="/"
        element={
          adminUserInfo ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Login page */}
      <Route path="/login" element={adminUserInfo ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/forget-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Admin routes */}
      <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
      <Route path="/userlist" element={<PrivateRoute element={<UsersList />} />} />
      <Route path="/wordlist" element={<PrivateRoute element={<WordList />} />} />
      <Route path="/wordlist/:wordId" element={<PrivateRoute element={<WordDetail />} />} />
      <Route path="/quizlist" element={<PrivateRoute element={<QuizList />} />} />
      <Route path="/forum" element={<PrivateRoute element={<ForumApproval />} />} />
      <Route path="/forum/topics/:id" element={<PrivateRoute element={<TopicDetail />} />} />
      <Route path="/userlist/:userID" element={<PrivateRoute element={<UserDetails />} />} />
      <Route path="/productlist" element={<PrivateRoute element={<ProductList />} />} />
      <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
      <Route path="/categories" element={<PrivateRoute element={<Categories />} />} />
    </Routes>
  );
}

export default App;
