FROM node:alpine3.22 AS base
WORKDIR /runtime

FROM base AS deps
RUN --mount=source=/package.json,target=/runtime/package.json,rw             \
    --mount=source=/package-lock.json,target=/runtime/package-lock.json,rw   \
    --mount=type=cache,sharing=private,target=/root/.npm                     \
    --mount=type=cache,sharing=private,target=/root/.cache                   \
    npm install

FROM deps AS runtime
COPY --link . .
# TODO: why are these needed ...
RUN chown -R node:node /runtime
USER node
EXPOSE 5173
ENTRYPOINT [ "npm", "run", "dev" ]
