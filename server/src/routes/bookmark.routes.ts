import {
  createBookmark,
  deleteBookmark,
  getBookmarks,
} from "#controllers/bookmark.controller.ts";
import { authenticateToken } from "#middleware/auth.middleware.ts";
import { validate } from "#middleware/validate.middleware.ts";
import { addBookmarkSchema } from "#validations/bookmark.validations.ts";
import { Router } from "express";

const router = Router();

router.use(authenticateToken);

router.get("/", getBookmarks);
router.post("/", validate(addBookmarkSchema), createBookmark);
router.delete("/:id", deleteBookmark);

export default router;
