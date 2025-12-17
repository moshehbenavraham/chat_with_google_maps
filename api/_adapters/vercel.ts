// Vercel serverless adapter
import { handle } from 'hono/vercel';
import { app } from '../_app.js';

// Export the Hono app for Vercel serverless functions
export default handle(app);
