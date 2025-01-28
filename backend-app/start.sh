#!/bin/sh

# migrate db
npx prisma migrate deploy

# start app
npm start