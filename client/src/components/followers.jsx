import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const Followers = () => {
  const { userId } = useParams(); // Get userId from the URL
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token =localStorage.getItem('authToken')

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3002/users/${userId}/followers`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                  },
            }
        );
        setFollowers(response.data);
      } catch (err) {
        setError("Failed to load followers.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId,token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-gray-600 text-xl">Loading followers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-red-600 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Followers</h2>
      <ul className="space-y-4">
        {followers.length === 0 ? (
          <li className="text-gray-600">No followers found.</li>
        ) : (
          followers.map((follower) => (
            <li key={follower._id} className="flex items-center space-x-4">
              <img
                src={`http://localhost:3002/${follower.profilePicture || "default-profile.jpg"}`}
                alt={`${follower.name}'s profile`}
                className="w-10 h-10 rounded-full border-2 border-gray-300 object-cover"
              />
              <p className="text-gray-800">{follower.name}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Followers;
