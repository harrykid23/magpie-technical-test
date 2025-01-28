# Stage 1: Base (Install dependencies)
FROM node:18-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm install --production
RUN npm install prisma
COPY . .
RUN npx prisma generate

# Stage 2: Build (Compile TypeScript to JavaScript)
FROM node:18-alpine AS build

WORKDIR /app
COPY --from=base /app /app
RUN npm run build

# Stage 3: Final (Run the application)
FROM node:18-alpine AS final

WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY --from=base /app/prisma /app/prisma
COPY --from=base /app/package*.json /app/
COPY --from=base /app/start.sh /app/start.sh
COPY --from=base /app/.env /app/.env

EXPOSE 3000

RUN chmod +x ./start.sh
CMD ["./start.sh"]