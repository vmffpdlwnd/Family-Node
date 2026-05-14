import express from 'express';
import pool from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT c.*, u.username FROM chats c JOIN users u ON c.user_id = u.id ORDER BY c.created_at ASC LIMIT 200',
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '채팅 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: '메시지 내용을 입력해주세요.' });
  }

  try {
    const [result] = await pool.query('INSERT INTO chats (user_id, message) VALUES (?, ?)', [req.user.id, message]);
    const [rows] = await pool.query('SELECT c.*, u.username FROM chats c JOIN users u ON c.user_id = u.id WHERE c.id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '메시지 전송 중 오류가 발생했습니다.' });
  }
});

export default router;
