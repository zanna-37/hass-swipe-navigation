FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
  curl \
  git \
  nano \
  && rm -rf /var/lib/apt/lists/*

# Install node
ENV NODE_MAJOR=24

RUN apt-get update \
  && export DEBIAN_FRONTEND=noninteractive \
  && apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
  && rm -rf /var/lib/apt/lists/*

RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
  && mkdir -p /etc/apt/keyrings \
  && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

RUN apt-get update \
  && export DEBIAN_FRONTEND=noninteractive \
  && apt-get install -y \
    nodejs \
  && rm -rf /var/lib/apt/lists/*

# Reset parent entrypoint
ENTRYPOINT []
