FROM node:16

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install packages
RUN yarn install

# Copy the app code
COPY . .

# Build the project
RUN yarn build

# Expose ports
EXPOSE 8080

# Run the application
CMD [ "node", "dist/start-manager.js" ]
