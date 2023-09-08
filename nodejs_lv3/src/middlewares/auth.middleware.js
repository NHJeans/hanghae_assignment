// src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

export default async function (req, res, next) {
  try {
    // 1. 클라이언트로 부터 쿠키(Cookie)를 전달받습니다.
    const { authorization } = req.cookies;
    if (!authorization) throw new Error("로그인이 필요한 기능입니다.");
    // 2. 쿠키(Cookie)로 부터 토큰 형식인지 확인합니다.
    const [tokenType, token] = authorization.split(" ");
    if (tokenType !== "Bearer") {
      throw new Error("토큰 타입이 일치하지 않습니다.");
    }
    // 3. 서버에서 발급한 JWT가 맞는지 검증합니다.
    const decodedToken = jwt.verify(token, "customized_secret_key");
    const userId = decodedToken.userId;
    // 4. JWT의 'userId'를 바탕으로 사용자를 조회합니다.
    const user = await prisma.users.findFirst({
      where: { userId: userId },
    });
    if (!user) {
      res.clearCookie("authorization");
      throw new Error("토큰 사용자가 존재하지 않습니다.");
    }

    // req.user에 사용자 정보를 저장합니다.
    req.user = user;

    next();
  } catch (error) {
    res.clearCookie("authorization"); // 토큰이 만료되었거나, 조작되었을 때, 쿠키를 제거합니다.

    switch (error.name) {
      case "TokenExpiredError":
        return res
          .status(403)
          .json({ errorMessage: "로그인이 필요한 기능입니다." });
      case "JsonWebTokenError":
        return res
          .status(403)
          .json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
      default:
        return res.status(403).json({
          errorMessage: error.message ?? "게시글 작성에 실패하였습니다.",
        });
    }
  }
}
