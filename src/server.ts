import express from "express";
import { userRouter } from "./routes/user.route";
import { passRouter } from "./routes/pass.route";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  return res.send({ message: "Hello World" });
});



app.use(userRouter);
app.use(passRouter);

app.listen(3333, () => {
  return console.log("Server is running port 3333");
});
