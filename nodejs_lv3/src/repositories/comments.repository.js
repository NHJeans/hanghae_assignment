import { CustomError } from "../errors/customError.js";
import { prisma } from "../utils/prisma/index.js";

class CommentRepository {
  createComment = async (userId, postId, comment) => {
    if (!comment || comment.trim() === "") {
      throw new CustomError(400, "댓글 내용을 입력해주세요.");
    }

    const post = await prisma.posts.findFirst({
      where: { postId: { equals: postId } },
    });
    if (!post) {
      throw new CustomError(404, "게시글이 존재하지 않습니다.");
    }

    const addComment = await prisma.comments.create({
      data: {
        UserId: userId,
        PostId: postId,
        comment,
      },
    });

    return { comment: addComment };
  };

  getComments = async (postId) => {
    const commentData = await prisma.Comments.findMany({
      where: {
        PostId: postId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        User: true,
      },
    });
    if (commentData.length === 0) {
      throw new CustomError(404, "댓글이 존재하지 않습니다.");
    }

    const rawData = commentData.map((comment) => ({
      commentId: comment.commentId,
      userId: comment.User.userId,
      nickname: comment.User.nickname,
      comment: comment.comment,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));

    return { comments: rawData };
  };

  updateComment = async (userId, commentId, comment) => {
    const existingComment = await prisma.comments.findUnique({
      where: { commentId: commentId },
    });

    if (!existingComment) {
      throw new CustomError(404, "댓글이 존재하지 않습니다.");
    }

    if (existingComment.UserId !== userId) {
      throw new CustomError(403, "댓글의 수정 권한이 존재하지 않습니다.");
    }

    const updatedComment = await prisma.comments.update({
      where: { commentId: commentId },
      data: { comment },
    });

    return { message: "댓글을 수정하였습니다." };
  };

  deleteComment = async (userId, commentId) => {
    const existingComment = await prisma.comments.findUnique({
      where: { commentId: commentId },
    });

    if (!existingComment) {
      throw new CustomError(404, "댓글이 존재하지 않습니다.");
    }

    if (existingComment.UserId !== userId) {
      throw new CustomError(403, "댓글의 삭제 권한이 존재하지 않습니다.");
    }

    await prisma.comments.delete({ where: { commentId: commentId } });

    return { message: "댓글이 성공적으로 삭제되었습니다." };
  };
}

export default new CommentRepository();
