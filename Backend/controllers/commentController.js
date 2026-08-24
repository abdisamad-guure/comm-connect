const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Post = require('../models/Post');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, getPaginationMeta } = require('../utils/pagination');

const authorFields = 'name profileImage location role';

const listComments = asyncHandler(async (req, res) => {
  const { post } = req.query;
  if (!post || !mongoose.isValidObjectId(post)) {
    throw new ApiError(400, 'A valid post query parameter is required');
  }

  const { page, limit, skip } = getPagination(req.query);
  const filter = { post, hidden: false };
  const [comments, total] = await Promise.all([
    Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('author', authorFields),
    Comment.countDocuments(filter),
  ]);

  res.json({ success: true, data: { comments }, meta: getPaginationMeta(page, limit, total) });
});

const listAllComments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [comments, total] = await Promise.all([
    Comment.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', authorFields)
      .populate('post', 'title'),
    Comment.countDocuments(),
  ]);

  res.json({ success: true, data: { comments }, meta: getPaginationMeta(page, limit, total) });
});

const createComment = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.body.post)) throw new ApiError(400, 'Invalid post');
  const post = await Post.findById(req.body.post);
  if (!post) throw new ApiError(404, 'Post not found');

  const comment = await Comment.create({ content: req.body.content, post: post._id, author: req.user._id });
  await comment.populate('author', authorFields);

  if (!post.author.equals(req.user._id)) {
    await Notification.create({
      recipient: post.author,
      type: 'comment',
      message: `${req.user.name} commented on your post`,
      post: post._id,
      comment: comment._id,
    });
  }

  res.status(201).json({ success: true, message: 'Comment created', data: { comment } });
});

const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.commentId,
    { content: req.body.content },
    { new: true, runValidators: true }
  )
    .populate('author', authorFields)
    .populate('post', 'title');

  if (!comment) throw new ApiError(404, 'Comment not found');

  res.json({ success: true, message: 'Comment updated', data: { comment } });
});

const setCommentVisibility = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  const post = await Post.findById(comment.post).select('author');
  if (!post) throw new ApiError(404, 'Post not found');
  if (req.user.role !== 'admin' && !post.author.equals(req.user._id)) {
    throw new ApiError(403, 'Only the post owner can hide this comment');
  }

  comment.hidden = req.body.hidden;
  await comment.save();
  res.json({
    success: true,
    message: comment.hidden ? 'Comment hidden from the discussion' : 'Comment restored to the discussion',
    data: { commentId: comment._id, hidden: comment.hidden },
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');
  const post = await Post.findById(comment.post).select('author');
  const ownsPost = post?.author.equals(req.user._id);
  if (req.user.role !== 'admin' && !comment.author.equals(req.user._id) && !ownsPost) {
    throw new ApiError(403, 'You cannot delete this comment');
  }

  await Promise.all([
    comment.deleteOne(),
    Notification.deleteMany({ comment: comment._id }),
  ]);
  res.json({ success: true, message: 'Comment deleted' });
});

module.exports = { listComments, listAllComments, createComment, updateComment, setCommentVisibility, deleteComment };
