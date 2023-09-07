// src/routes/comments.router.js
import express from "express";
import {
  createComment,
  getComment,
  updateComment,
  deleteComment,
} from "../controllers/comments.controllers.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// 1. 댓글을 작성하려는 클라이언트가 로그인된 사용자인지 검증합니다.
// 2. 댓글 작성을 위한 게시글 ID를 params로부터 전달받습니다.
// 3. 댓글 생성을 위한 `content`를 body로부터 전달받습니다.
// 4. Comments 테이블에 댓글을 생성합니다.

/** 댓글 생성 API **/

// 댓글 생성
router.post("/posts/:postId/comments", authMiddleware, createComment);
// 댓글 조회
router.get("/posts/:postId/comments", authMiddleware, getComment);
// // 댓글 수정
router.put("/posts/:postId/comments/:commentId", authMiddleware, updateComment);
// // 댓글 삭제
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  deleteComment
);

export default router;
