import express from 'express'
import { protectRoute } from '../middlewares/auth.middlware.js';
import { arcjetProtection} from '../middlewares/arcjet.middleware.js'
import { getAllContacts, getMessageByUserId, sendMessage, getChatPartners } from '../controllers/messages.controller.js';


const router = express.Router();

router.use(arcjetProtection,protectRoute);

router.get('/contacts', getAllContacts);
router.get('/chats',  getChatPartners);
router.get('/:id', getMessageByUserId);
router.post('/send/:id', sendMessage);


export default router;