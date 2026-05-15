import express from 'express';
import pool from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const roomId = req.query.room_id || 'family';
  try {
    const [rows] = await pool.query(
      'SELECT c.*, u.username, u.nickname FROM chats c JOIN users u ON c.user_id = u.id WHERE c.room_id = ? ORDER BY c.created_at ASC LIMIT 200',
      [roomId],
    );
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '채팅 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { room_id, message } = req.body;
  if (!message) {
    return res.status(400).json({ error: '메시지 내용을 입력해주세요.' });
  }
  if (!room_id) {
    return res.status(400).json({ error: 'room_id가 필요합니다.' });
  }

  try {
    const [result] = await pool.query('INSERT INTO chats (user_id, room_id, message) VALUES (?, ?, ?)', [req.user.id, room_id, message]);
    const [rows] = await pool.query('SELECT c.*, u.username, u.nickname FROM chats c JOIN users u ON c.user_id = u.id WHERE c.id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '메시지 전송 중 오류가 발생했습니다.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const chatId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM chats WHERE id = ?', [chatId]);
    if (!rows.length) {
      return res.status(404).json({ error: '메시지를 찾을 수 없습니다.' });
    }
    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: '메시지 삭제 권한이 없습니다.' });
    }

    await pool.query('DELETE FROM chats WHERE id = ?', [chatId]);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '메시지 삭제 중 오류가 발생했습니다.' });
  }
});

export default router;
