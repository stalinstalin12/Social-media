import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaCamera, FaSignOutAlt, FaUsers, FaUserPlus } from "react-icons/fa"; // Import relevant icons

const baseUrl = "http://localhost:3002";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null); // To hold the selected image
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login"); // Redirect to login if no token is found
          return;
        }

        const response = await axios.get(`${baseUrl}/userprofile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.data); // Set user data from the response
        setLoading(false); // Stop loading
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile. Please try again.");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove token from localStorage
    navigate("/login"); // Redirect to login page
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Show the selected image in frontend immediately
    }
  };

  const handleProfilePictureSave = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login"); // Redirect to login if no token is found
        return;
      }

      const formData = new FormData();
      formData.append("profilePicture", image); // Append the image file

      const response = await axios.put(
        `${baseUrl}/update-profile-picture`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Update the user profile with the new image URL
      setUser({ ...user, profilePicture: response.data.profilePicture });
    } catch (error) {
      console.error("Error saving profile picture:", error);
      setError("Failed to save the profile picture. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24">
      <div className="container mx-auto p-4 sm:p-8 lg:p-12 max-w-4xl lg:w-1/3 bg-white shadow-xl rounded-lg">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome, {user.name}</h1>

        {/* Profile Picture */}
        <div className="flex justify-center mb-8 relative">
          <div className="relative">
            <img
              src={user.profilePicture ? `${baseUrl}/${user.profilePicture}` : "/default-profile.png"} // Fallback image
              alt="Profile"
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full object-cover border-4 border-gray-300 shadow-lg"
            />
            <div className="absolute bottom-2 right-8 p-2 bg-gray-600 rounded-full cursor-pointer">
              <label htmlFor="file-input">
                <FaCamera className="text-white text-lg sm:text-xl" />
              </label>
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="text-center mb-6">
          <p className="text-xl font-semibold">{user.name}</p>
          <p className="text-gray-600">{user.email}</p>
          <p className="mt-2 text-gray-500">{user.bio || "No bio available"}</p>
        </div>

        {/* Save Profile Picture Button */}
        {image && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleProfilePictureSave}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
            >
              Save Profile Picture
            </button>
          </div>
        )}

        {/* Followers and Following Section */}
        <div className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <Link to={`/user/${user._id}/followers`}>
            <div className="bg-blue-50 p-6 rounded-lg shadow-lg flex flex-col items-center transition-transform transform hover:scale-105 hover:shadow-2xl">
              <div className="text-red-600 text-3xl mb-2">
                <FaUsers />
              </div>
              <p className="text-lg font-semibold text-gray-700">Followers</p>
              <p className="text-2xl font-bold text-gray-800">{user.followers.length}</p>
            </div>
            </Link>
            <Link to={`/user/${user._id}/following`}>
            <div className="bg-green-50 p-6 rounded-lg shadow-lg flex flex-col items-center transition-transform transform hover:scale-105 hover:shadow-2xl">
              <div className="text-green-600 text-3xl mb-2">
                <FaUserPlus />
              </div>
              <p className="text-lg font-semibold text-gray-700">Following</p>
              <p className="text-2xl font-bold text-gray-800">{user.following.length}</p>
            </div>
            </Link>
          </div>
        </div>

        {/* Edit Profile and Logout Button */}
        <div className="flex mt-6 flex-col sm:flex-row justify-center items-center gap-6">
          <div className="flex items-center gap-2">
            <FaEdit className="text-blue-500" />
            <button
              onClick={() => navigate("/updateUser")}
              className="text-blue-500 hover:text-blue-600 transition"
            >
              Edit Profile
            </button>
          </div>
          <div className="flex items-center gap-2">
            <FaSignOutAlt className="text-red-500" />
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Interests Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-center mb-4">Your Interests</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {user.interests && user.interests.length > 0 ? (
              user.interests.map((interest, index) => (
                <div
                  key={index}
                  className="bg-black text-white text-sm sm:text-md font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
                >
                  {interest}
                </div>
              ))
            ) : (
              <p className="text-gray-500">You have not added any interests yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
