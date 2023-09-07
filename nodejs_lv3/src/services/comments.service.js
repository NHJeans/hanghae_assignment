import CommentRepository from "../repositories/comments.repository.js";

class CommentService {
  createComment = async (userId, postId, comment) => {
    const result = await CommentRepository.createComment(
      userId,
      postId,
      comment
    );
    return result;
  };

  getComments = async (postId) => {
    const result = await CommentRepository.getComments(postId);
    return result;
  };

  updateComment = async (userId, commentId, comment) => {
    const result = await CommentRepository.updateComment(
      userId,
      commentId,
      comment
    );
    return result;
  };

  deleteComment = async (userId, commentId) => {
    const result = await CommentRepository.deleteComment(userId, commentId);
    return result;
  };
}

export default new CommentService();
