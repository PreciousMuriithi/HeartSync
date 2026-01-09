// HeartSync Server - Main Router
// Made with 💕 for Precious & Safari

import { router } from '../trpc';
import { authRouter } from './auth';
import { messagesRouter } from './messages';
import { flagsRouter } from './flags';
import { lettersRouter } from './letters';
import { coupleRouter } from './couple';
import { memoryRouter } from './memory';
import { gamesRouter } from './games';

export const appRouter = router({
    auth: authRouter,
    messages: messagesRouter,
    flags: flagsRouter,
    letters: lettersRouter,
    couple: coupleRouter,
    memory: memoryRouter,
    games: gamesRouter,
});

export type AppRouter = typeof appRouter;
