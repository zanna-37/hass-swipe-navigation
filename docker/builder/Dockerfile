FROM ubuntu

RUN apt-get update && apt-get install -y \
  curl \
  git \
  nano \
  && rm -rf /var/lib/apt/lists/*

# Install node LTS
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get update && apt-get install -y \
  nodejs \
  && rm -rf /var/lib/apt/lists/*

# Workaround to upgrade npm to 9 # TODO: Remove when npm 9 is in LTS
RUN npm install -g npm@latest

# Reset parent entrypoint
ENTRYPOINT []
