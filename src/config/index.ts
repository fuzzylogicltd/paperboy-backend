import merge from "lodash.merge";

import * as local from "./local";
import * as prod from "./prod";

process.env.NODE_ENV = process.env.NODE_ENV || "development";
const stage = process.env.STAGE || "local";

const defaultConfig = {
  stage,
  env: process.env.NODE_ENV,
  port: 3001,
  secrets: {
    jwt: process.env.JWT_SECRET,
    dbUrl: process.env.DATABASE_URL,
  },
};

let envConfig;

if (stage === "production") {
  envConfig = prod;
} else {
  envConfig = local;
}

export default merge(defaultConfig, envConfig);
