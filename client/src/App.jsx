import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home'; // Adjust the path based on your folder structure
import LoginPage from './components/login';
import SignupPage from './components/signup';
import Profile from './components/profile';
import CreatePost from './components/post';
import UserPage from './components/userPage';
import AdminDashboard from './components/admin/adminHome';
import Search from './components/search';
import PostView from './components/postview';
import UpdateUser from './components/updateUser';
import Followers from './components/followers';
import Following from './components/following';


function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/Home" element={<Home/>} />
        <Route path="/updateUser" element={<UpdateUser/>} />
        <Route path="/user/:userId/followers" element={<Followers />} />
        <Route path="/user/:userId/following" element={<Following />} />
        <Route path="/Profile" element={<Profile/>} />
        <Route path="/Login" element={<LoginPage/>} />
        <Route path="/Signup" element={<SignupPage/>} />
        <Route path="/search" element={<Search />} />
        <Route path="/post/:postId" component={<PostView/>} />
        <Route path="/Post" element={<CreatePost/>} />
        <Route path="/adminHome" element={<AdminDashboard/>} />
        <Route path="/user/:userId" element={<UserPage />} />
      </Routes>
    </Router>
  );
}

export default App;
