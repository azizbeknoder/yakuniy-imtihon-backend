import { config } from "dotenv";
config();
export default function configFunction(name) {
  return process.env[name];
}
