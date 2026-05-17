import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Typography,
  Button,
  Spin,
  Result,
  Input,
  Space,
  Select,
  List,
  Avatar,
  message,
  Divider,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { getPost, getComments, createComment, deleteComment, updatePost, deletePost } from '../api/apiClient';
import useAuthStore from '../store/authStore';
import RichTextEditor from '../components/RichTextEditor';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isGuest = !user || user.role === 'guest';

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('일반');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [commentText, setCommentText] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPost(id),
    enabled: !!id,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => getComments(id),
    enabled: !!id,
  });

  const { mutate: savePost, isLoading: isSaving } = useMutation({
    mutationFn: ({ postId, payload }) => updatePost(postId, payload),
    onSuccess: () => {
      message.success('게시글이 수정되었습니다.');
      setIsEditing(false);
      queryClient.invalidateQueries(['post', id]);
      queryClient.invalidateQueries(['posts']);
    },
    onError: (error) => {
      message.error(error.message || '게시글 수정에 실패했습니다.');
    },
  });

  const { mutate: removePost, isLoading: isDeletingPost } = useMutation({
    mutationFn: (postId) => deletePost(postId),
    onSuccess: () => {
      message.success('게시글이 삭제되었습니다.');
      queryClient.invalidateQueries(['posts']);
      navigate('/board');
    },
    onError: (error) => {
      message.error(error.message || '게시글 삭제에 실패했습니다.');
    },
  });

  const { mutate: addComment, isLoading: isPostingComment } = useMutation({
    mutationFn: (payload) => createComment(payload),
    onSuccess: () => {
      message.success('댓글이 등록되었습니다.');
      setCommentText('');
      queryClient.invalidateQueries(['comments', id]);
      queryClient.invalidateQueries(['posts']);
    },
    onError: (error) => {
      message.error(error.message || '댓글 등록에 실패했습니다.');
    },
  });

  const { mutate: removeComment, isLoading: isDeletingComment } = useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
    onSuccess: () => {
      message.success('댓글이 삭제되었습니다.');
      queryClient.invalidateQueries(['comments', id]);
      queryClient.invalidateQueries(['posts']);
    },
    onError: (error) => {
      message.error(error.message || '댓글 삭제에 실패했습니다.');
    },
  });

  useEffect(() => {
    if (data) {
      setTitle(data.title || '');
      setCategory(data.category || '일반');
      setContent(data.content || '');
      setImageUrl(data.image_url || data.imageUrl || data.image || '');
      setImagePreviewError(false);
    }
  }, [data]);

  const canEdit = user && (user.role === 'admin' || data?.user_id === user.id);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      message.warning('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      category,
    };

    if (imageUrl.trim()) {
      payload.image_url = imageUrl.trim();
    }

    savePost({ postId: id, payload });
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) {
      message.warning('댓글을 입력해주세요.');
      return;
    }

    addComment({ post_id: id, content: commentText.trim() });
  };

  const renderCommentActions = (comment) => {
    const commentId = comment.id || comment.comment_id;
    const canDelete = user && (user.role === 'admin' || comment.user_id === user.id);
    if (!canDelete) return [];

    return [
      <Button
        key="delete"
        type="text"
        danger
        icon={<DeleteOutlined />}
        loading={isDeletingComment}
        onClick={() => removeComment(commentId)}
      >
        삭제
      </Button>,
    ];
  };


  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status="404"
          title="게시글을 불러오지 못했습니다"
          subTitle={error?.message || '게시글을 찾을 수 없거나 접근할 수 없습니다.'}
          extra={[
            <Button key="back" onClick={() => navigate('/board')}>
              게시판으로 돌아가기
            </Button>,
          ]}
        />
      </div>
    );
  }

  const imageSource = imageUrl.trim();

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/board')}>
            뒤로가기
          </Button>

          <Space>
            {canEdit && (
              <Button
                icon={isEditing ? <CloseOutlined /> : <EditOutlined />}
                onClick={() => setIsEditing((prev) => !prev)}
              >
                {isEditing ? '편집 취소' : '게시글 수정'}
              </Button>
            )}
            {canEdit && !isEditing && (
              <Popconfirm
                title="게시글을 삭제하시겠습니까?"
                okText="삭제"
                cancelText="취소"
                onConfirm={() => removePost(id)}
              >
                <Button danger icon={<DeleteOutlined />} loading={isDeletingPost}>
                  삭제
                </Button>
              </Popconfirm>
            )}
            {isEditing && (
              <Button type="primary" icon={<SaveOutlined />} loading={isSaving} onClick={handleSave}>
                저장
              </Button>
            )}
          </Space>
        </div>

        {isEditing ? (
          <Space direction="vertical" size="large" style={{ width: '100%', marginTop: 16 }}>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="제목을 입력하세요" />
            <Select value={category} onChange={(value) => setCategory(value)} style={{ width: 200 }}>
              <Option value="일반">일반</Option>
              <Option value="공지">공지</Option>
              <Option value="생활">생활</Option>
            </Select>
            <Card style={{ borderRadius: 12, padding: 0 }}>
              <RichTextEditor value={content} onChange={setContent} />
            </Card>
            <Input
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value);
                setImagePreviewError(false);
              }}
              placeholder="이미지 URL을 입력하세요 (옵션)"
            />
            {imageSource && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={imageSource}
                  alt="게시글 이미지 미리보기"
                  style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 12, objectFit: 'contain' }}
                  onError={() => setImagePreviewError(true)}
                />
                {imagePreviewError && <Text type="danger">이미지를 불러올 수 없습니다. URL을 확인해 주세요.</Text>}
              </div>
            )}
          </Space>
        ) : (
          <>
            <Title level={3} style={{ marginTop: 16 }}>
              {data.title}
            </Title>
            <Paragraph>
              <Text strong>작성자:</Text> {data.nickname || data.username || '익명'}
              <br />
              <Text strong>카테고리:</Text> {data.category || '일반'}
              <br />
              <Text strong>작성일:</Text> {data.created_at ? new Date(data.created_at).toLocaleString() : '-'}
            </Paragraph>
            {imageSource && (
              <div style={{ marginBottom: 20 }}>
                <img
                  src={imageSource}
                  alt="게시글 첨부 이미지"
                  style={{ maxWidth: '100%', maxHeight: 420, borderRadius: 16, objectFit: 'contain' }}
                  onError={() => setImagePreviewError(true)}
                />
                {imagePreviewError && <Text type="danger">이미지를 불러올 수 없습니다.</Text>}
              </div>
            )}
            <Card type="inner" style={{ whiteSpace: 'pre-wrap' }}>
              <div
                dangerouslySetInnerHTML={{ __html: data.content || '' }}
                style={{ minHeight: 120 }}
              />
            </Card>
          </>
        )}
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>
              댓글 {comments.length}
            </Title>
          </div>

          <List
            itemLayout="horizontal"
            dataSource={comments}
            loading={commentsLoading}
            locale={{ emptyText: '등록된 댓글이 없습니다.' }}
            renderItem={(item) => {
              const commentId = item.id || item.comment_id;
              const commentAuthor = item.nickname || item.username || '익명';
              const commentDate = item.created_at ? new Date(item.created_at).toLocaleString() : '';
              return (
                <List.Item actions={renderCommentActions({ ...item, id: commentId })} style={{ alignItems: 'flex-start' }}>
                  <List.Item.Meta
                    avatar={<Avatar>{commentAuthor.charAt(0)}</Avatar>}
                    title={<span style={{ fontWeight: 600 }}>{commentAuthor}</span>}
                  />
                  <div style={{ width: '100%' }}>
                    <div style={{ whiteSpace: 'pre-wrap', margin: '8px 0' }}>{item.content}</div>
                    <div style={{ color: '#999', fontSize: 12 }}>{commentDate}</div>
                  </div>
                </List.Item>
              );
            }}
          />

          <div>
            <TextArea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              rows={4}
              placeholder={user && user.role !== 'guest' ? '댓글을 입력하세요.' : '로그인 후 댓글을 작성할 수 있습니다.'}
              disabled={!user || user.role === 'guest'}
            />
            <Space style={{ marginTop: 12 }}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={isPostingComment}
                onClick={handleCommentSubmit}
                disabled={!user || user.role === 'guest'}
              >
                등록
              </Button>
              <Button onClick={() => setCommentText('')}>
                취소
              </Button>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default BoardDetail;
