import express from 'express';
import pool from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY created_at ASC');
    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '채팅방 목록을 가져오는 중 오류가 발생했습니다.' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: '채팅방 제목을 입력해주세요.' });
  }

  try {
    const [result] = await pool.query('INSERT INTO rooms (title) VALUES (?)', [title]);
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '채팅방 생성 중 오류가 발생했습니다.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const roomId = req.params.id;

  try {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
    if (!rows.length) {
      return res.status(404).json({ error: '채팅방을 찾을 수 없습니다.' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '채팅방 삭제 권한이 없습니다.' });
    }

    await pool.query('DELETE FROM rooms WHERE id = ?', [roomId]);
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '채팅방 삭제 중 오류가 발생했습니다.' });
  }
});

export default router;
