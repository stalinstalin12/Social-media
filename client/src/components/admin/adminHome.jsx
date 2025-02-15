import{ useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaFileAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "http://localhost:3002"; // Replace with your backend URL

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [usersResponse, postsResponse, recentUsersResponse, recentPostsResponse] =
          await Promise.all([
            axios.get(`${baseUrl}/admin/total-users`),
            axios.get(`${baseUrl}/admin/total-posts`),
            axios.get(`${baseUrl}/admin/recent-users`),
            axios.get(`${baseUrl}/admin/recent-posts`),
          ]);

        setTotalUsers(usersResponse.data.total);
        setTotalPosts(postsResponse.data.total);
        setRecentUsers(recentUsersResponse.data.users);
        setRecentPosts(recentPostsResponse.data.posts);
      } catch (error) {
        toast.error("Failed to load dashboard data");
        console.error("Error fetching admin data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      <header className="bg-white shadow p-4">
        <h1 className="text-2xl font-bold text-red-500">Admin Dashboard</h1>
      </header>
      <main className="container mx-auto py-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white shadow p-6 rounded-lg flex items-center">
                <FaUsers className="text-4xl text-red-500" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Total Users</h2>
                  <p className="text-2xl">{totalUsers}</p>
                </div>
              </div>
              <div className="bg-white shadow p-6 rounded-lg flex items-center">
                <FaFileAlt className="text-4xl text-blue-500" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Total Posts</h2>
                  <p className="text-2xl">{totalPosts}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold">Recent Users</h2>
              <div className="bg-white shadow p-4 rounded-lg mt-4">
                {recentUsers.length === 0 ? (
                  <p>No recent users.</p>
                ) : (
                  <table className="w-full table-auto">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2">Name</th>
                        <th className="border px-4 py-2">Email</th>
                        <th className="border px-4 py-2">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="border px-4 py-2">{user.name}</td>
                          <td className="border px-4 py-2">{user.email}</td>
                          <td className="border px-4 py-2">
                            {new Date(user.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold">Recent Posts</h2>
              <div className="bg-white shadow p-4 rounded-lg mt-4">
                {recentPosts.length === 0 ? (
                  <p>No recent posts.</p>
                ) : (
                  <table className="w-full table-auto">
                    <thead>
                      <tr>
                        <th className="border px-4 py-2">User</th>
                        <th className="border px-4 py-2">Content</th>
                        <th className="border px-4 py-2">Posted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPosts.map((post) => (
                        <tr key={post.id}>
                          <td className="border px-4 py-2">{post.userName}</td>
                          <td className="border px-4 py-2">{post.text}</td>
                          <td className="border px-4 py-2">
                            {new Date(post.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
