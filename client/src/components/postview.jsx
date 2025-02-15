import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const baseUrl = "http://localhost:3002";

const PostView = () => {
  const { postId } = useParams();  // Retrieve the postId from the URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${baseUrl}/post/${postId}`);  // Get post by ID
        setPost(response.data);
      } catch (err) {
        console.log(err)
        setError('Error fetching the post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="post-view">
      {post && (
        <div>
          <h2 className="text-2xl font-bold">{post.title}</h2>
          <p>{post.text}</p> {/* Display full text */}
        </div>
      )}
    </div>
  );
};

export default PostView;
