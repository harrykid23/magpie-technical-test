# Stage 1: Base (Install dependencies)
FROM node:18-alpine AS base

WORKDIR /app
COPY ./backend-app /app/backend-app
COPY ./shared /app/shared
WORKDIR /app/backend-app
RUN npm install --production
RUN npm install prisma
RUN npx prisma generate

# Stage 2: Build (Compile TypeScript to JavaScript)
FROM node:18-alpine AS build

WORKDIR /app
COPY --from=base /app /app
WORKDIR /app/backend-app
RUN npm run build

# Stage 3: Final (Run the application)
FROM node:18-alpine AS final

WORKDIR /app/backend-app
COPY --from=build /app/backend-app/dist /app/backend-app/dist
COPY --from=build /app/backend-app/node_modules /app/backend-app/node_modules
COPY --from=build /app/backend-app/prisma /app/backend-app/prisma
COPY --from=build /app/backend-app/package*.json /app/backend-app/
COPY --from=build /app/backend-app/start.sh /app/backend-app/start.sh
COPY --from=build /app/backend-app/.env /app/backend-app/.env

EXPOSE 3000

RUN chmod +x ./start.sh
CMD ["./start.sh"]