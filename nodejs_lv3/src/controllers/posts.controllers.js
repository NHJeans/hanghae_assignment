import PostService from "../services/posts.service.js";
import asyncHandler from "../lib/asyncHandler.js";

// 게시글 작성
export const createPost = asyncHandler(async (req, res, next) => {
  const { userId } = req.user;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ errorMessage: "제목과 내용은 필수입니다." });
  }
  const result = await PostService.createPost(userId, title, content); // service 의 result가 반환
  return res.status(201).json(result);
});

// 게시글 목록 조회
export const listPosts = asyncHandler(async (req, res) => {
  const result = await PostService.listPosts();
  res.status(200).json(result);
});

// 게시글 상세 조회
export const getOnePost = asyncHandler(async (req, res, next) => {
  const { postId } = req.params;

  const result = await PostService.getOnePost(postId);
  return res.status(200).json(result);
});

// 게시글 수정
export const updatePost = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res
      .status(403)
      .send({ errorMessage: "로그인이 필요한 기능입니다." });
  }
  const { userId } = req.user;
  const { title, content } = req.body;
  const postId = req.params.postId;

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

  const result = await PostService.updatePost(userId, postId, title, content);
  return res.status(200).json(result);
});

/** 게시글 삭제 API **/
export const deletePost = asyncHandler(async (req, res, next) => {
  const { userId } = req.user;
  const postId = req.params.postId;
  const result = await PostService.deletePost(userId, postId);
  return res.status(200).json(result);
});
