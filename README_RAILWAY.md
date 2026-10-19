# PGSSTROY.PRO — Railway backend

## Files
- `server.js` — Express API + static frontend server
- `package.json` — Node dependencies and start command

## Railway variables
Required:
- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `JWT_SECRET` — long random secret (do not use the example value)

Railway will provide `PORT` automatically.

## API
- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/data` (Bearer JWT)
- `PUT /api/data` (Bearer JWT, optimistic version)
- `GET /api/objects` (Bearer JWT)

The database schema is created automatically on first start. No manual SQL is required.
