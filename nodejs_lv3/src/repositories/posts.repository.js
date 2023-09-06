import { CustomError } from "../errors/customError.js";
import { prisma } from "../utils/prisma/index.js";

class PostRepository {
  // 서비스로부터 받은 데이터를 DB조회 등등..
  createPost = async (userId, title, content) => {
    const post = await prisma.posts.create({
      data: {
        title,
        content,
        UserId: userId,
      },
    });
    console.log(post);
    return { message: "게시글 작성에 성공하였습니다." };
  };

  listPosts = async () => {
    const rawData = await prisma.posts.findMany({
      include: { User: true },
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

    return posts;
  };

  getOnePost = async (postId) => {
    const post = await prisma.posts.findUnique({
      where: {
        postId: postId,
      },
      include: { User: true },
    });

    if (!post) {
      throw new CustomError(404, "게시글을 찾을 수 없습니다.");
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

    return postPayload;
  };

  updatePost = async (userId, postId, title, content) => {
    const post = await getPostById(postId);

    if (post.UserId !== userId) {
      throw new CustomError(403, "게시글의 수정의 권한이 존재하지 않습니다.");
    }

    await prisma.posts.update({
      where: { postId: req.params.postId },
      data: { title, content },
    });
    console.log("DB Post User ID:", post.userId);
    console.log("Request User ID:", req.user.userId);

    return { message: "게시글을 수정하였습니다." };
  };

  deletePost = async (userId, postId) => {
    const post = await getPostById(postId);

    if (post.UserId !== userId) {
      throw new CustomError(403, "게시글의 삭제 권한이 존재하지 않습니다.");
    }

    await prisma.posts.delete({ where: { postId: req.params.postId } });

    return { message: "게시글을 삭제하였습니다." };
  };

  /* 게시글 존재여부는 중복되므로 함수로 분리 */
  getPostById = async (postId) => {
    const post = await prisma.posts.findUnique({
      where: { postId },
    });
    if (!post) {
      throw new CustomError(404, "게시글이 존재하지 않습니다.");
    }
    return post;
  };
}

export default new PostRepository();
