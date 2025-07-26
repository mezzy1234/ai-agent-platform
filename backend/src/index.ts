import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Load environment variables from .env file when running locally
dotenv.config();

// Initialize Supabase client using the service role key. The service role key is used
// because these routes run on the backend and need elevated privileges (e.g. to
// insert execution records). NEVER expose the service role key to the client!
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeSecretKey, {
  // Use the latest API version supported by Stripe's Node library
  apiVersion: '2023-10-16',
});

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Endpoint: POST /api/execute-agent
 *
 * This endpoint is called by the frontend or a cron job to trigger an n8n agent
 * run. It accepts a userId and agentId in the request body, triggers the
 * corresponding n8n webhook (if configured via N8N_WEBHOOK_URL), and logs an
 * execution entry to the Supabase `executions` table. You can extend this
 * handler to include additional payload data to send to your workflows.
 */
app.post('/api/execute-agent', async (req: Request, res: Response) => {
  const { userId, agentId, payload } = req.body;
  if (!userId || !agentId) {
    return res.status(400).json({ error: 'Missing userId or agentId' });
  }
  try {
    // Trigger the n8n workflow via webhook if configured. Note that the webhook
    // must be created in your n8n instance, and should expect query params or
    // request bodies matching what you send here.
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (webhookUrl) {
      // Use node-fetch or the built‑in fetch API available in recent Node.js versions
      await fetch(`${webhookUrl}?userId=${encodeURIComponent(userId)}&agentId=${encodeURIComponent(agentId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      });
    }
    // Record the execution in Supabase. The status is initially set to
    // 'queued'; your n8n workflow can update this later via the API or
    // direct database access using the service role key.
    const { error } = await supabase.from('executions').insert([
      {
        user_id: userId,
        agent_id: agentId,
        status: 'queued',
        result: null,
      },
    ]);
    if (error) {
      console.error('Failed to insert execution:', error.message);
      return res.status(500).json({ error: 'Unable to record execution' });
    }
    return res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to trigger agent' });
  }
});

/**
 * Endpoint: GET /api/credentials/:userId
 *
 * Returns the stored credentials for a given user. This endpoint is used by
 * n8n workflows to retrieve tokens (e.g. Gmail, OpenAI) for the executing
 * user. Row level security (RLS) on the `credentials` table prevents
 * unauthorized users from reading other users' credentials.
 */
app.get('/api/credentials/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('credentials')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      throw error;
    }
    return res.json(data);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

/**
 * Endpoint: POST /api/create-checkout-session
 *
 * Creates a Stripe Checkout Session for a subscription plan. The frontend
 * passes a Stripe Price ID in the body (planId). The server responds with
 * the session ID, which the frontend uses to redirect the user to Stripe
 * Checkout. Remember to set FRONTEND_URL in your environment so that Stripe
 * can redirect users back to your site after payment.
 */
app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
  const { planId } = req.body as { planId: string };
  if (!planId) {
    return res.status(400).json({ error: 'Missing planId' });
  }
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planId,
          quantity: 1,
        },
      ],
      success_url: `${frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/billing?canceled=true`,
    });
    return res.json({ sessionId: session.id });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Endpoint: POST /api/stripe/webhook
 *
 * Handles incoming Stripe webhook events. It's important to verify the
 * signature of the incoming payload using your webhook secret (provided
 * by Stripe) to prevent spoofed events. After verification, the server
 * processes subscription events such as checkout completion, invoice paid,
 * and subscription deletion. You should implement logic here to unlock
 * access for users (e.g. updating their plan in Supabase) based on the
 * subscription metadata.
 */
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: mark user as subscribed to the chosen plan. You can look up
      // session.subscription or session.customer, associate them with a user
      // in your database, and update their plan in Supabase.
      break;
    }
    case 'invoice.paid': {
      // Handle successful invoice payment
      break;
    }
    case 'customer.subscription.deleted': {
      // Handle subscription cancellation
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({ received: true });
});

// Health check route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'AI Agent Platform backend is running' });
});

// Start the server
const port = parseInt(process.env.PORT || '8080', 10);
app.listen(port, () => {
  console.log(`\u{1F680} Backend server listening on port ${port}`);
});
