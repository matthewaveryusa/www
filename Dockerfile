FROM node:alpine
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app
USER node
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
CMD [ "npm", "run", "start"]
