# Stage 1: Base (Install dependencies)
FROM node:18-alpine AS base

WORKDIR /app
COPY ./frontend-app /app/frontend-app
COPY ./shared /app/shared
WORKDIR /app/frontend-app
RUN npm install

# Stage 2: Build (Compile TypeScript to JavaScript)
FROM node:18-alpine AS build

WORKDIR /app
COPY --from=base /app /app
WORKDIR /app/frontend-app
RUN npm run build

# Stage 3: Final (Run the application)
FROM node:18-alpine AS final
WORKDIR /app/frontend-app
COPY --from=build /app/frontend-app/.next /app/frontend-app/.next
COPY --from=build /app/frontend-app/node_modules /app/frontend-app/node_modules
COPY --from=build /app/frontend-app/package*.json /app/frontend-app/
COPY --from=build /app/frontend-app/start.sh /app/frontend-app/start.sh
COPY --from=build /app/frontend-app/.env /app/frontend-app/.env

EXPOSE 3001

RUN chmod +x ./start.sh
CMD ["./start.sh"]