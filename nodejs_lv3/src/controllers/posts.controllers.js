import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

// 게시글 작성
export const createPost = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ errorMessage : "제목과 내용은 필수입니다." });
    }

    const post = await prisma.posts.create({
      data: {
        title,
        content,
        UserId: userId,
      },
    });

    return res.status(201).json({ message: "게시글 작성에 성공하였습니다." });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "게시글 작성 중 오류가 발생했습니다." });
  }
};

// 게시글 목록 조회
export const listPosts = async (req, res) => {
  try {
    const rawData = await prisma.posts.findMany({
      select: {
        postId: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            userId: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const posts = rawData.map((post) => ({
      postId: post.postId,
      userId: post.User.userId,
      nickname: post.User.nickname,
      title: post.title,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    res.status(200).json({ posts: posts });
  } catch (error) {
    res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
};

// 게시글 상세 조회
export const getOnePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await prisma.posts.findUnique({
      where: {
        postId: postId,
      },
      select: {
        postId: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            userId: true,
            nickname: true,
          },
        },
      },
    });

    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: "게시글을 찾을 수 없습니다." });
    }

    const postPayload = {
      post: {
        postId: post.postId,
        userId: post.User.userId,
        nickname: post.User.nickname,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    };

    return res.status(200).json(postPayload);
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
};

// 게시글 수정
export const updatePost = async (req, res, next) => {
  const { userId } = req.user;
  const { title, content } = req.body;

  if (!title || !content) {
    return res
      .status(412)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
  }
  if (typeof title !== "string" || title.length > 100) {
    return res
      .status(412)
      .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
  }

  if (typeof content !== "string" || content.length > 1000) {
    return res
      .status(412)
      .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
  }

  try {
    // 해당 게시글이 존재하는지 확인
    const post = await prisma.posts.findUnique({
      where: { postId: req.params.postId },
    });

    // 게시글이 존재하지 않는 경우
    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }

    if (post.UserId !== userId) {
      return res
        .status(403)
        .json({ errorMessage: "게시글 수정의 권한이 존재하지 않습니다." });
    }
    // 게시글 수정
    await prisma.posts.update({
      where: { postId: req.params.postId },
      data: { title, content },
    });
    console.log("DB Post User ID:", post.userId);
    console.log("Request User ID:", req.user.userId);
    return res.status(200).json({ message: "게시글을 수정하였습니다." });
  } catch (err) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 수정에 실패하였습니다." });
  }
};

/** 게시글 삭제 API **/
export const deletePost = async (req, res, next) => {
  const { userId } = req.user;

  try {
    const post = await prisma.posts.findUnique({
      where: { postId: req.params.postId },
    });

    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    }

    if (post.UserId !== userId) {
      return res
        .status(403)
        .json({ errorMessage: "게시글의 삭제 권한이 존재하지 않습니다." });
    }

    await prisma.posts.delete({ where: { postId: req.params.postId } });

    return res.status(200).json({ message: "게시글을 삭제하였습니다." });
  } catch (err) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 작성에 실패하였습니다." });
  }
};
