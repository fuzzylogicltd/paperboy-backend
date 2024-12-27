import app from "./server";
import config from "./config";

app.listen(config.port, () => {
  console.log(`hello on http://localhost:${config.port}`);
});
