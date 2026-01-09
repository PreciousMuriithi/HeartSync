// HeartSync 2.0 - tRPC Client
// Made with 💕 for Precious & Safari

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@heartsync/server/src/routers';

export const trpc = createTRPCReact<AppRouter>();
