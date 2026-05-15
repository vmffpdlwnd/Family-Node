import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: '토큰이 필요합니다.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

router.post('/register', async (req, res) => {
  const { username, password, nickname, role = 'guest' } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username과 password가 필요합니다.' });
  }

  try {
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length) {
      return res.status(409).json({ error: '이미 존재하는 사용자입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, nickname, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, nickname || null, role],
    );

    return res.status(201).json({ id: result.insertId, username, nickname: nickname || null, role });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '회원가입 중 오류가 발생했습니다.' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username과 password가 필요합니다.' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = users[0];
    if (!user) {
      return res.status(401).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({ token, user: { id: user.id, username: user.username, nickname: user.nickname || null, role: user.role } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '로그인 중 오류가 발생했습니다.' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, nickname, role, created_at, last_login FROM users WHERE id = ?', [req.user.id]);
    if (!users.length) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    return res.json(users[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '사용자 정보를 불러오는 중 오류가 발생했습니다.' });
  }
});

router.get('/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  }

  try {
    const [users] = await pool.query('SELECT id, username, nickname, role, created_at, last_login FROM users ORDER BY created_at ASC');
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '사용자 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

router.put('/users/:id/role', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  }

  const { role } = req.body;
  const allowedRoles = ['guest', 'member', 'admin'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: '유효하지 않은 역할입니다.' });
  }

  if (parseInt(req.params.id, 10) === req.user.id) {
    return res.status(403).json({ error: '자기 자신의 역할은 변경할 수 없습니다.' });
  }

  try {
    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    const [users] = await pool.query('SELECT id, username, nickname, role, created_at FROM users WHERE id = ?', [req.params.id]);
    return res.json(users[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '사용자 역할 변경 중 오류가 발생했습니다.' });
  }
});

router.put('/me', authenticateToken, async (req, res) => {
  const { nickname } = req.body;

  try {
    await pool.query('UPDATE users SET nickname = ? WHERE id = ?', [nickname || null, req.user.id]);
    const [users] = await pool.query('SELECT id, username, nickname, role, created_at, last_login FROM users WHERE id = ?', [req.user.id]);
    if (!users.length) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    return res.json(users[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '프로필 업데이트 중 오류가 발생했습니다.' });
  }
});

export default router;
