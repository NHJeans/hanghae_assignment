
import express from 'express';
import { createPost, listPosts, getOnePost, updatePost, deletePost } from '../controllers/posts.controllers.js';
import authMiddleware from '../middlewares/auth.middleware.js';


const router = express.Router();

// 게시글 생성
router.post("/posts", authMiddleware, createPost);
// 게시글 목록 조회
router.get("/posts", authMiddleware, listPosts);
// 게시글 상세 조회
router.get("/posts/:postId", getOnePost);
// 게시글 수정
router.put("/posts/:postId", authMiddleware, updatePost);
// 게시글 삭제
router.delete("/posts/:postId", authMiddleware, deletePost);

export default router;
// /** 게시글 생성 API 비즈니스 로직
// 1. 게시글을 작성하려는 클라이언트가 로그인된 사용자인지 검증합니다.
// 2. 게시글 생성을 위한 `title`, `content`를 body로부터 전달받습니다.
// 3. Posts 테이블에 게시글을 생성합니다.
// */
// /** 게시글 생성 API **/
// router.post("/posts", authMiddleware, async (req, res, next) => {

//   try {
//     const { userId } = req.user; // 인증된 유저의 ID를 가져옴
//     const { title, content } = req.body;

//     if (!title || !content) {
//       return res.status(400).json({ error: "제목과 내용은 필수입니다." });
//     }

//     const post = await prisma.posts.create({
//       data: {
//         title,
//         content,
//         UserId: userId,
//       },
//     });

//     return res.status(201).json({ "message": "게시글 작성에 성공하였습니다." });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ error: "게시글 작성 중 오류가 발생했습니다." });
//   }
// });


// /** 게시글 목록 조회 API **/
// router.get("/posts", authMiddleware, async (req, res) => {
//   try {
//     const rawData = await prisma.posts.findMany({
//       select: {
//         postId: true,
//         title: true,
//         createdAt: true,
//         updatedAt: true,
//         User: {
//           select: {
//             userId: true,
//             nickname: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     const posts = rawData.map((post) => ({
//       postId: post.postId,
//       userId: post.User.userId,
//       nickname: post.User.nickname,
//       title: post.title,
//       createdAt: post.createdAt,
//       updatedAt: post.updatedAt,
//     }));

//     res.status(200).json({ posts: posts });
//   } catch (error) {
//     res.status(500).json({ error: "An error occurred while fetching posts." });
//   }
// });


// /** 게시글 상세 조회 API **/
// router.get("/posts/:postId", async (req, res, next) => {
//   try {
//     const { postId } = req.params;

//     const post = await prisma.posts.findUnique({
//       where: {
//         postId: postId,
//       },
//       select: {
//         postId: true,
//         title: true,
//         content: true,
//         createdAt: true,
//         updatedAt: true,
//         User: {
//           select: {
//             userId: true,
//             nickname: true,
//           },
//         },
//       },
//     });

//     // 만약 postId에 해당하는 게시글이 없으면 404 에러를 반환
//     if (!post) {
//       return res.status(404).json({ errorMessage: "게시글을 찾을 수 없습니다." });
//     }

//     const postPayload = {
//       post: {
//         postId: post.postId,
//         userId: post.User.userId,
//         nickname: post.User.nickname,
//         title: post.title,
//         content: post.content,
//         createdAt: post.createdAt,
//         updatedAt: post.updatedAt,
//       },
//     };

//     return res.status(200).json(postPayload);
//   } catch (error) {
//     return res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." });
//   }
// });

// export default router;


