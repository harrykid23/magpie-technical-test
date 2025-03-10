This is a [Magpie](https://magpie.co.id) technical test project built with Fastify, Prisma, and NextJS.

## Setting Environment Variables

First, set the `.env` file for both backend and frontend app. Example :

```bash
# backend-app/.env
PORT="3000"
NODE_ENV="development"
DATABASE_URL="postgresql://username:password@localhost:5432/your_db_name?schema=public"
JWT_SECRET="<your-jwt-secret>"
```

```bash
# frontend-app/.env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
```

## Running Backend App

The backend app is working with Prisma so we have to deploy the database schema first and populate the data.

```bash
# setting up dependencies
cd backend-app
npm install
npx prisma generate
npx prisma migrate deploy

# populatng data
npx prisma db seed

# run the server
npm run dev
```

You can modify the `backend-app/seed.ts` and adjust your initial data as needed.

## Running Frontend App

```bash
# setting up dependencies
cd frontend-app
npm install

# run the server
npm run dev
```

## Live Deployment

You can check the deployed app from [this link](https://magpie-frontend.harrykid23.my.id/). You can login with these credentials :

- `andy@gmail.com` : `superadmin`
- `denny@gmail.com` : `admin123`

## API Documentation

You can check the API Documentation by [this file](./backend-app/api_documentation.yaml). You can use Swagger or OpenAPI-supported software to open it.

## Future Improvements

To make this app better, there are several things to do :

- Add more features : this app still have a few features, it's better if we can have Member Management features inside this app too so we don't have to manage the members by database.
- Split frontend and backend to different repository : as the features grow, it's better to have different repository. In this case, backend API should be improved too regarding to the error message to avoid confusion in frontend developers side.
