import express from 'express'; // express module
import helmet from "helmet"; // helmet module
import session from "express-session"; // express-session module
import parser from "body-parser"; // body-parser module
import { router as encryptDecryptRouter } from "./routes/router.js";
const app = express();
const port = 50500;
app.use(
    session({
        secret: "crypto22sess",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true, maxAge: 300000 },
    })
); // express-session settings
app.use(express.urlencoded({
    extended: false, // use querystring library to parse URL-encoded data
})); // to support URL-encoded bodies
app.use(parser.text()); // to support text bodies
app.use(helmet()); // Helmet secures Express from some well-known web vulnerabilities by setting HTTP headers
app.use(express.static("./view/")); // to serve static files
app.use(express.static("./node_modules/bootstrap/dist/")); // bootstrap static files
app.use("/encrypt_decrypt", encryptDecryptRouter);
app.use((err, request, response, next) => { // Error handler middleware
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    response.status(statusCode).end();
});
app.get("*", (request, response) => {
    response.status(404).end();
});
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});