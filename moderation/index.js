const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/events", async (req, res) => {
  const { data, type } = req.body;

  if (type === "CommentCreated") {
    if (data.content.includes("orange")) {
      data.status = "rejected";
    } else {
      data.status = "moderated";
    }

    await axios.post("http://localhost:4005/events", {
      type: "CommentModerated",
      data: data,
    });
  }
  res.send({ status: 201 });
});
app.listen(4003, console.log("Moderation on 4003"));
