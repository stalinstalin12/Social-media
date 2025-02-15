import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Following = () => {
  const { userId } = useParams(); // Get userId from the URL
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:3002/users/${userId}/following`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const followingData = response.data.following;
        if (Array.isArray(followingData)) {
          setFollowing(followingData);
        } else {
          throw new Error("Following data is not an array.");
        }
      } catch (err) {
        setError("Failed to load following.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
        <p className="text-gray-600 text-xl animate-bounce">Loading following...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
        <p className="text-red-600 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        People You Follow
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {following.length === 0 ? (
          <p className="col-span-full text-center text-gray-600 text-xl">
            You are not following anyone.
          </p>
        ) : (
          following.map((user) => (
            <div
              key={user._id}
              className="relative bg-gradient-to-r from-indigo-50 to-blue-200 text-black p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              <div className="absolute top-3 right-3 bg-blue-200 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold shadow">
                Following
              </div>
              <div className="flex items-center space-x-4">
                <img
                  src={
                    user.profilePicture
                      ? `http://localhost:3002/${user.profilePicture}`
                      : "http://localhost:3002/default-profile.jpg"
                  }
                  alt={`${user.name}'s profile`}
                  className="w-16 h-16 rounded-full border-2 border-white object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold">{user.name}</h3>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <button className="bg-white text-indigo-500 px-4 py-2 rounded-full shadow hover:bg-gray-100">
                  View Profile
                </button>
                <button className="bg-red-500 px-4 py-2 rounded-full shadow hover:bg-red-600">
                  Unfollow
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Following;
