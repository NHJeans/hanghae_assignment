import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/sign-up", async (req, res, next) => {
  try {
    const { nickname, password, confirm } = req.body;

    // 닉네임 형식 검사 (예: 길이, 특수 문자 등에 따라 변경 가능)
    if (!nickname || !password || !confirm) {
      return res
        .status(400)
        .send({ message: "요청한 데이터 형식이 올바르지 않습니다." });
    }

    const nicknamePattern = /^[a-zA-Z0-9]{3,}$/; //최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)`로 구성
    if (!nicknamePattern.test(nickname)) {
      return res
        .status(412)
        .json({ errorMessage: "닉네임의 형식이 일치하지 않습니다." });
    }
    // 패스워드 형식 검사 (예: 길이, 특수 문자 등에 따라 변경 가능)
    const passwordPattern = /^.{4,}$/; // `최소 4자 이상
    if (!passwordPattern.test(password)) {
      return res
        .status(412)
        .json({ errorMessage: "패스워드 형식이 일치하지 않습니다." });
    }
    // 패스워드가 일치하는지 검사
    if (password !== confirm) {
      return res
        .status(412)
        .json({ errorMessage: "패스워드가 일치하지 않습니다." });
    }

    // 패스워드에 닉네임 포함 여부 검사
    if (password.includes(nickname)) {
      return res
        .status(412)
        .json({ errorMessage: "패스워드에 닉네임이 포함되어 있습니다." });
    }

    const isExistUser = await prisma.users.findFirst({
      where: {
        nickname,
      },
    });

    if (isExistUser) {
      return res.status(412).json({ errorMessage: "중복된 닉네임입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        nickname,
        password: hashedPassword,
      },
    });

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (err) {
    return res
      .status(400)
      .json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
  }
});

/** 로그인 API **/
router.post("/login", async (req, res, next) => {
  const { nickname, password } = req.body;
  const user = await prisma.users.findFirst({ where: { nickname } });

  if (!user)
    return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
  // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
  else if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

  // 로그인에 성공하면, 사용자의 userId를 바탕으로 토큰을 생성합니다.
  const token = jwt.sign(
    {
      userId: user.userId,
    },
    "customized_secret_key",
    { expiresIn: '1h' } 
  );

  // authotization 쿠키에 Berer 토큰 형식으로 JWT를 저장합니다.
  res.cookie("authorization", `Bearer ${token}`);
  return res.status(200).json({ message: "로그인 성공" });
});

/** 사용자 조회 API **/
router.get("/users", authMiddleware, async (req, res, next) => {
  const { userId } = req.user;

  console.log("UserID:", userId); // 여기서 userId 값을 확인합니다.

  try {
    const user = await prisma.users.findFirst({
      where: {
        userId: {
          equals: userId,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
