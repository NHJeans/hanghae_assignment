import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

export const createComment = async (req, res, next) => {
  try {
    if (!req.user) {
      return res
        .status(403)
        .json({ errorMessage: "로그인이 필요한 기능입니다." });
    }

    const { postId } = req.params;
    const { userId } = req.user;
    const { comment } = req.body;


    if (!comment || comment.trim() === "") {
      return res
        .status(412)
        .json({ errorMessage: "댓글 내용을 입력해주세요." });
    }


    const post = await prisma.posts.findFirst({
      where: { postId: { equals: postId } },
    });
    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }

    const addComment = await prisma.comments.create({
      data: {
        UserId: userId,
        PostId: postId,
        comment,
      },
    });

    return res.status(201).json({ comments: addComment });
  } catch (error) {
 
    if (error.message) {
      return res.status(400).json({ errorMessage: error.message });
    } else {
      return res
        .status(400)
        .json({ errorMessage: "댓글 작성에 실패하였습니다." });
    }
  }
};

// 댓글 목록 조회 API
export const getComment = async (req, res, next) => {
  const { postId } = req.params;

  const post = await prisma.Posts.findFirst({
    where: { postId: postId },
  });
  if (!post)
    return res
      .status(404)
      .json({ errorMessage: "게시글이 존재하지 않습니다." });

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

  // 댓글을 삭제하고 나면 빈배열 형태로 나타나기에 예외처리
  if (commentData.length === 0) {
    return res.status(404).json({ message: "댓글이 존재하지 않습니다." });
  }

  const comments = commentData.map((comment) => ({
    commentId: comment.commentId,
    userId: comment.UserId,
    nickname: comment.User.nickname,
    comment: comment.comment,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  }));

  return res.status(200).json({ posts: comments });
};

// ** 게시글 수정 API **/
export const updateComment = async (req, res, next) => {
  const { postId, commentId } = req.params;
  const { comment } = req.body;

  if (!comment)
    return res
      .status(412)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });

  try {
    const post = await prisma.Posts.findUnique({
      where: { postId: postId },
    });

    if (!post)
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });

    const existingComment = await prisma.Comments.findUnique({
      where: { commentId: commentId },
    });

    if (!existingComment)
      return res
        .status(404)
        .json({ errorMessage: "댓글이 존재하지 않습니다." });

    if (existingComment.UserId !== req.user.userId) {
      return res
        .status(403)
        .json({ errorMessage: "댓글의 수정 권한이 존재하지 않습니다." });
    }

    await prisma.Comments.update({
      where: { commentId: commentId },
      data: { comment },
    });

    return res.status(200).json({ message: "댓글을 수정하였습니다." });
  } catch (err) {
    return res
      .status(400)
      .json({ errorMessage: "댓글 수정에 실패하였습니다." });
  }
};

// 댓글 삭제 API
export const deleteComment = async (req, res, next) => {
  const { postId, commentId } = req.params;
  const authenticatedUserId = req.user.userId;
  console.log("Authenticated User ID:", authenticatedUserId);

  try {
    const post = await prisma.Posts.findUnique({
      where: { postId },
    });

    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }

    const existingComment = await prisma.Comments.findUnique({
      where: { commentId: commentId },
    });

    if (!existingComment) {
      return res
        .status(404)
        .json({ errorMessage: "댓글이 존재하지 않습니다." });
    } else if (existingComment.UserId !== authenticatedUserId) {
      return res
        .status(403)
        .json({ errorMessage: "댓글의 삭제 권한이 존재하지 않습니다." });
    }

    await prisma.Comments.delete({
      where: { commentId: commentId },
    });

    return res
      .status(200)
      .json({ message: "댓글이 성공적으로 삭제되었습니다." });
  } catch (error) {
    console.error(error);

    if (error.message.includes("not found")) {
      return res
        .status(404)
        .json({ errorMessage: "댓글이 존재하지 않습니다." });
    }

    res.status(400).json({ errorMessage: "댓글 삭제에 실패하였습니다." });
  }
};
