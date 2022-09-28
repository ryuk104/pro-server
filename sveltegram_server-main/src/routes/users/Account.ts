import { Router } from "express";

import { customEmojiAdd } from "./customEmojiAdd";
import { customEmojiDelete } from "./customEmojiDelete";
import { customEmojiRename } from "./customEmojiRename";
import { customStatusChange } from "./customStatusChange";
import { serverPositionUpdate } from "./serverPositionUpdate";
import { statusChange } from "./statusChange";




const AccountRouter = Router();

customEmojiAdd(AccountRouter);
customEmojiDelete(AccountRouter);
customEmojiRename(AccountRouter);
customStatusChange(AccountRouter);
serverPositionUpdate(AccountRouter);
statusChange(AccountRouter);



export { router }
