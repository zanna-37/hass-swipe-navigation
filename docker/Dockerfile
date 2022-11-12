FROM ubuntu

RUN apt-get update && apt-get install -y \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Install node LTS
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get update && apt-get install -y \
  nodejs \
  && rm -rf /var/lib/apt/lists/*

# Reset parent entrypoint
ENTRYPOINT []
