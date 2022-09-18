const express = require("express");
const cors = require("cors");
const { randomBytes } = require("crypto");
const { default: axios } = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

//creating a comment
app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const comments = commentsByPostId[req.params.id] || [];
  comments.push({
    id: commentId,
    content,
    status: "pending",
  });

  commentsByPostId[req.params.id] = comments;

  //sending events
  await axios.post("http://localhost:4005/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: "pending",
    },
  });
  res.status(201).send(comments);
});

app.get("/comments", (req, res) => {
  res.send(commentsByPostId);
});

app.post("/events", async (req, res) => {
  console.log("Event type: ", req.body.type);
  const { type, data } = req.body;

  if (type === "CommentModerated") {
    console.log("came here alse");
    const { postId } = data;
    const _index = commentsByPostId[postId].findIndex(
      (comment) => comment.id === data.id
    );
    commentsByPostId[postId][_index] = {
      id: data.id,
      content: data.content,
      postId: data.postId,
      status: data.status,
    };

    await axios.post("http://localhost:4005/events", {
      type: "CommentUpdated",
      data: { ...commentsByPostId[postId][_index] },
    });
  }

  res.send({ status: 201 });
});

app.listen(4001, () => {
  console.log("Listening on 4001");
});
