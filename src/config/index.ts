import merge from "lodash.merge";

import * as local from "./local";
import * as prod from "./prod";

const stage = process.env.STAGE === "production" ? "production" : "local";

const defaultConfig = {
  stage,
  secrets: {
    jwt: process.env.JWT_SECRET,
    dbUrl: process.env.DATABASE_URL,
  },
};

let envConfig;

console.log(`stage: ${stage}`);

if (stage === "production") {
  envConfig = prod.default;
} else {
  envConfig = local.default;
}

const mergedConfig = merge(defaultConfig, envConfig);

console.log(mergedConfig);

export default mergedConfig;
