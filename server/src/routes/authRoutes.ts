import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const authRoutes = Router();

authRoutes.post('/login', AuthController.login);
authRoutes.post('/cadastrar', AuthController.cadastrar);

export default authRoutes;