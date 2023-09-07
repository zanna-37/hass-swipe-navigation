FROM ubuntu

RUN apt-get update && apt-get install -y \
  curl \
  git \
  nano \
  && rm -rf /var/lib/apt/lists/*

# Install node
ENV NODE_MAJOR=20

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

# Workaround to upgrade npm to 9 # TODO: Remove when npm 9 is in LTS
RUN npm install -g npm@latest

# Reset parent entrypoint
ENTRYPOINT []
