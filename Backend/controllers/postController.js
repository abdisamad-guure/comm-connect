const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Post = require('../models/Post');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

const authorFields = 'name profileImage location role';

function canManagePost(post, user) {
  return user.role === 'admin' || post.author.equals(user._id);
}

const listPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [posts, total] = await Promise.all([
    Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('author', authorFields),
    Post.countDocuments(),
  ]);

  res.json({ success: true, data: { posts }, meta: getPaginationMeta(page, limit, total) });
});

const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId).populate('author', authorFields);
  if (!post) throw new ApiError(404, 'Post not found');

  res.json({ success: true, data: { post } });
});

const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create({
    title: req.body.title,
    content: req.body.content,
    image: req.file ? `/uploads/${req.file.filename}` : null,
    author: req.user._id,
  });
  await post.populate('author', authorFields);

  res.status(201).json({ success: true, message: 'Post created', data: { post } });
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found');
  if (!canManagePost(post, req.user)) throw new ApiError(403, 'You cannot update this post');

  let changed = false;
  for (const field of ['title', 'content']) {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
      changed = true;
    }
  }
  if (req.file) {
    post.image = `/uploads/${req.file.filename}`;
    changed = true;
  }
  if (!changed) throw new ApiError(400, 'Provide at least one post field to update');

  await post.save();
  await post.populate('author', authorFields);
  res.json({ success: true, message: 'Post updated', data: { post } });
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found');
  if (!canManagePost(post, req.user)) throw new ApiError(403, 'You cannot delete this post');

  await Promise.all([
    post.deleteOne(),
    Comment.deleteMany({ post: post._id }),
    Notification.deleteMany({ post: post._id }),
  ]);
  res.json({ success: true, message: 'Post deleted' });
});

const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found');

  const alreadyLiked = post.likes.some((userId) => userId.equals(req.user._id));
  if (alreadyLiked) {
    post.likes.pull(req.user._id);
  } else {
    post.likes.addToSet(req.user._id);
  }
  await post.save();

  res.json({
    success: true,
    message: alreadyLiked ? 'Post unliked' : 'Post liked',
    data: { liked: !alreadyLiked, likesCount: post.likes.length },
  });
});

module.exports = { listPosts, getPost, createPost, updatePost, deletePost, toggleLike };
