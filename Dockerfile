FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY public ./public
COPY scripts ./scripts
RUN mkdir -p uploads && chown -R node:node /app
USER node
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
