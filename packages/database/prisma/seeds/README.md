# Seeds

`seed.ts` is an idempotent local-development seed. It creates one verified demo
user (`john.doe@example.com` / `password123`) so you can sign in right after
pushing the schema.

```sh
pnpm db:push   # apply the schema to your local database
pnpm db:seed   # create the demo user
```

Add your own seeders in this directory and call them from `seed.ts`. Do not run
this seed against production: the demo password is public.
