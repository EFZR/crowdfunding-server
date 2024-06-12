import { CorsOptions } from "cors";

export const corsConfig: { [key: string]: CorsOptions } = {
  developement: {
    origin: function (_, callback) {
      callback(null, true);
    },
  },

  staging: {
    origin: function (origin, callback) {
      const whiteList = [process.env.FRONTEND_URL];

      if (whiteList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Error de CORS."));
      }
    },
  },

  production: {
    origin: function (origin, callback) {
      const whiteList = [process.env.FRONTEND_URL];

      if (whiteList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Error de CORS."));
      }
    },
  },
};
