import express from "express";

import { userRouter } from "./routes/user.route";
import { passRouter } from "./routes/pass.route";
import { userRequestRouter } from "./routes/userRequests.route";
import { instructorRequestRouter } from "./routes/instructorRequest.route";
import { instructorRouter } from "./routes/instructor.route";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  return res.send({ message: "Hello World" });
})

app.use(userRouter); //Rota de ccriação de usuário e login
app.use(instructorRouter) //Rota de criação de instrutor
app.use(passRouter); //Rota de reset password

app.use("/users", userRequestRouter)
app.use("/instructors", instructorRequestRouter)



app.listen(3333, () => {
  return console.log("Server is running port 3333");
});
