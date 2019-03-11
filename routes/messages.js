const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Message = require('../models/Message');
const { requireUser } = require('../middlewares/auth');

router.get('/', requireUser, async (req, res, next) => {
  const { _id } = req.session.currentUser;
  try {
    const messages = await Message.find({ participant: _id }).populate('creator');
    const myMessages = await Message.find({ creator: _id }).populate('participant');
    res.render('messages/messages', { messages, myMessages });
  } catch (error) {
    next(error);
  }
});

router.get('/new', requireUser, (req, res, next) => {
  res.render('messages/message-new');
});

router.get('/:id/edit', requireUser, async (req, res, next) => {
  const { id } = req.params;
  try {
    const message = await Message.findById(id);
    console.log(message);
    res.render('messages/message-edit', { message });
  } catch (error) {
    next(error);
  }
});

router.post('/new', requireUser, async (req, res, next) => {
  const { _id } = req.session.currentUser;
  const { name, body } = req.body;
  try {
    const participant = await User.findOne({ name });
    const messageInfo = {
      body: {
        message: body
      },
      participant: participant._id,
      creator: _id
    };
    const message = await Message.create(messageInfo);
    console.log(message);
    res.redirect('/messages');
  } catch (error) {
    next(error);
  }
});

router.post('/delete/:id', requireUser, async (req, res, next) => {
  const { id } = req.params;
  try {
    await Message.findByIdAndDelete(id);
    res.redirect('/messages');
  } catch (error) {
    next(error);
  }
});

router.post('/:id/edit', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { message } = req.body;
  try {
    const messages = await Message.findByIdAndUpdate(id, { $push: { body: { message } } }, { new: true });
    console.log(messages);
    res.redirect(`/messages/${id}/edit`);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
