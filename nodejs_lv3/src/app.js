import express from "express";
import cookieParser from "cookie-parser";
import LogMiddleware from "./middlewares/log.middleware.js";
import ErrorHandlingMiddleware from "./middlewares/errorHandler.js";
import UsersRouter from "./routes/users.router.js";
import PostsRouter from "./routes/posts.router.js";
import CommentsRouter from "./routes/comments.router.js";
import { prisma } from "./utils/prisma/index.js";

(async () => {
  const app = express();
  const PORT = 3018;
  await prisma.$connect();

  app.use(LogMiddleware);
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api", [UsersRouter, PostsRouter, CommentsRouter]);
  app.use(ErrorHandlingMiddleware);

  app.listen(PORT, () => {
    console.log(PORT, "포트로 서버가 열렸어요!");
  });
})();
