# INFO5995 — Final Exam Practice

Running revision notes for the final exam (50%, hurdle — "similar difficulty to
the quizzes"). Add topics here as they come up; keep each entry terse.

## Cryptography

### Perfect Secrecy

Conditions the key must meet (one-time pad):

1. **Random** — key must be truly (uniformly) random.
2. **Same length** — key must be at least as long as the message.
3. **Only used once** — key must never be reused.

### HMAC

1. **Hash the key and the message** — keyed hash: combine the secret key with
   the message and hash, giving integrity + authenticity.
