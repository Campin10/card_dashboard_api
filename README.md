# Card Dashboard API

## Description

Card Dashboard API is a RESTful API built with NestJS that interacts with MongoDB and integrates with the Stripe API. This API provides endpoints to manage and retrieve card metrics, transactions, and activity events.

## Libraries and Dependencies

### Core Dependencies

- **@nestjs/common**: Provides the core functionalities for NestJS applications.
- **@nestjs/config**: Loads environment variables and configuration settings.
- **@nestjs/mongoose**: Integrates Mongoose with NestJS for MongoDB operations.
- **@nestjs/platform-express**: Provides Express support for NestJS.
- **@nestjs/swagger**: Generates Swagger documentation for your API.
- **class-transformer**: Used to transform and serialize data.
- **class-validator**: Provides validation decorators for class properties.
- **mongoose**: The MongoDB ODM used for database interactions.
- **stripe**: Stripe's Node.js SDK for interacting with the Stripe API.
- **uuid**: Generates UUIDs for unique identifiers.

## Prerequisites

1. **Node.js**: Ensure Node.js is installed. This project uses Node.js version `>=20.17.0`.
2. **Docker**: Ensure Docker is installed for running MongoDB via Docker Compose.

## Setup and Installation

1. **Install dependencies** : npm install
2. **Run docker compose** : docker compose up
3. **Configure .env variables** : use the .env.example add the stripe key
4. **Run the api** : npm start
