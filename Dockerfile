FROM node:22-alpine
WORKDIR /app
COPY package.json server.js ./
COPY lib ./lib
COPY public ./public
ENV HOST=0.0.0.0
ENV PORT=3847
EXPOSE 3847
CMD ["npm", "start"]
