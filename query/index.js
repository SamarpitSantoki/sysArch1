const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  if (type === "PostCreated") {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;

    const post = posts[postId];
    post.comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    const { id, postId } = data;
    const post = posts[postId];
    const _index = post.comments.find((comment) => comment.id === id);
    post.comments[_index] = { ...post.comments[_index], ...data };
  }
  res.send({ status: 201 });
});

app.listen(4002, console.log("Query runnig on 4002"));
