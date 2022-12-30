import { Router } from "./types.js";

export interface BaseController {
  getRoutes(): Router;
}
