import  { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const baseUrl = "http://localhost:3002"; // Adjust to your actual base URL

const UpdateUser = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the user data to prefill the form
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${baseUrl}/userprofile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(response.data.data); // Prefill user data in form
        setLoading(false);
      } catch (err) {
        console.log(err)
        setLoading(false);
        setError("Failed to load user data.");
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset previous errors
    setSuccess(""); // Reset previous success message

    // Simple client-side validation
    if (!userData.name || !userData.email || !userData.address) {
      setError("All fields are required.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(`${baseUrl}/update-user`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("User details updated successfully.");
      setUserData(response.data.data); // Update the form with the response data
    } catch (err) {
        console.log(err)
      setError("Error updating user details.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-center text-2xl font-bold text-gray-900">Update Your Details</h2>

        {/* Error Message */}
        {error && <div className="text-red-500 text-center">{error}</div>}
        {/* Success Message */}
        {success && <div className="text-green-500 text-center">{success}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={userData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={userData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              name="address"
              id="address"
              rows="3"
              value={userData.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            ></textarea>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Update Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUser;
