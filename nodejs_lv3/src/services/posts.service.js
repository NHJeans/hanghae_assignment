import PostRepository from "../repositories/posts.repository.js";

class PostService {
  createPost = async (userId, title, content) => {
    const result = await PostRepository.createPost(userId, title, content); // repository에서 return한값
    return result;
  };

  listPosts = async () => {
    const result = await PostRepository.listPosts()
    return result
  }

  getOnePost = async (postId) => {
    const result = await PostRepository.getOnePost(postId)
    return result
  } 

  updatePost = async (userId, postId, title, content) => {
    const result = await PostRepository.updatePost(userId, postId, title, content)
    return result
  }

  deletePost = async (userId, postId) => {
    const result = await PostRepository.deletePost(userId, postId)
    return result
  }
}

export default new PostService();
