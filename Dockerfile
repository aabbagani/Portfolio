# Build Stage
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Run Stage
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy built frontend
COPY --from=build /app/dist ./dist

# Copy backend files
COPY server.ts ./
COPY portfolio.db ./
# Copy uploads if they exist (though Cloud Run is ephemeral)
COPY uploads ./uploads

# Install tsx to run server.ts directly or compile to JS
RUN npm install -g tsx

EXPOSE 8080
ENV PORT=8080

CMD ["tsx", "server.ts"]
