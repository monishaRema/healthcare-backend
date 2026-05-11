import app from "./app";
import { env } from "./app/config/env";

const bootstrap = () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Server failed: ", error);
  }
};

bootstrap();
