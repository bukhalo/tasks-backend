FROM node:17-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
ADD . .
RUN npm run build && npm prune --production

CMD [ "node", "dist/main.js" ]
