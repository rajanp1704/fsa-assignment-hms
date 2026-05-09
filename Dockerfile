# ================= BASE =================
FROM node:22-alpine AS base
WORKDIR /app

# ================= SERVER BUILD =================
FROM base AS server-builder
WORKDIR /app/server

COPY server/package*.json ./
RUN npm install

COPY server/ .
RUN npm run build

# ================= CLIENT BUILD =================
FROM base AS client-builder
WORKDIR /app/client

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY client/package*.json ./
RUN npm install

COPY client/ .
RUN npm run build

# ================= SERVER RUNTIME =================
FROM base AS server
WORKDIR /app/server

COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/node_modules ./node_modules
COPY --from=server-builder /app/server/package*.json ./

EXPOSE 5000
CMD ["npm", "start"]

# ================= CLIENT RUNTIME =================
FROM base AS client
WORKDIR /app/client

COPY --from=client-builder /app/client/.next ./.next
COPY --from=client-builder /app/client/public ./public
COPY --from=client-builder /app/client/node_modules ./node_modules
COPY --from=client-builder /app/client/package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
