import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const interestsList = ['Music', 'Sports', 'Technology', 'Gaming', 'Travel', 'Art', 'Food','Fitness'];

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    age: '',
    bio: '',
    interests: [],
    profilePicture: '',
  });

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInterestsChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => {
      const updatedInterests = prev.interests.includes(value)
        ? prev.interests.filter((interest) => interest !== value)
        : [...prev.interests, value];
      return { ...prev, interests: updatedInterests };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicture: reader.result, // Set the base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post('http://localhost:3002/users', formData);
      setSuccessMessage('Welcome to the network! Your account has been created.');
      console.log(response.data);
      // Redirect logic can go here
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen w-2/5 mx-auto flex items-center p-10 justify-center px-4">
      <div className="bg-white bg-gradient-to-r from-red-200 to-blue-100 p-8 rounded-xl shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Join Our Social Network
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Connect, share, and explore with people like you!
        </p>

        {error && <p className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</p>}
        {successMessage && (
          <p className="bg-green-100 text-green-600 p-3 rounded mb-4">{successMessage}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-gray-700 font-medium">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              minLength="6"
            />
          </div>

          {/* Age */}
          <div>
            <label htmlFor="age" className="block text-gray-700 font-medium">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter your age"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-gray-700 font-medium">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us something about yourself"
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows="4"
            ></textarea>
          </div>

          {/* Interests */}
            <div>
              <label htmlFor="interests" className="block text-gray-700 font-medium mb-2">
                Interests
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {interestsList.map((interest) => {
                  const isSelected = formData.interests.includes(interest);
                  return (
                    <label
                      key={interest}
                      onClick={() => handleInterestsChange({ target: { value: interest } })}
                      className={`flex items-center justify-center space-x-2 p-2 rounded-lg shadow-sm cursor-pointer 
                      ${
                        isSelected
                          ? "bg-red-400 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={interest}
                        checked={isSelected}
                        onChange={handleInterestsChange}
                        className="hidden" // Hides the checkbox
                      />
                      <span>{interest}</span>
                    </label>
                  );
                })}
              </div>
            </div>



           {/* Profile Picture */}
           <div>
            <label htmlFor="profilePicture" className="block text-gray-700 font-medium">
              Profile Picture
            </label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-lg shadow-md hover:from-purple-600 hover:to-blue-600"
          >
            Sign Up
          </button>

          <p className="text-center text-gray-600 mt-4">
          Already a user?{" "}
          <Link to="/Login" className="text-purple-600 font-medium hover:underline">
            Login
          </Link>
        </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
