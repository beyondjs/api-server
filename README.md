# @beyond-js/api-server

This package provides a dynamic HTTP API server implementation using Express.js. It is a server prepared to seamlessly
work with the BeyondJS framework, including support for hot module replacement (HMR) and OpenAPI specification
validation, allowing for efficient development and deployment of API services.

## Features

-   **Express.js Integration**: Leverages the Express framework for building web applications.
-   **OpenAPI Validation**: Integrates `express-openapi-validator` for API request and response validation based on
    OpenAPI specs.
-   **Hot Module Replacement (HMR)**: Supports HMR to handle changes in routes dynamically without restarting the
    server.
-   **Connection Management**: Manages active connections efficiently to ensure graceful server restarts and shutdowns.

## Installation

```bash
npm install @beyond-js/api-server
```

## Usage

### Basic Setup

```typescript
import { Server } from '@beyond-js/api-server';

const server = new Server();
server.start('@beyond-js/your-module');
```

### Module Structure

Your module should export the following structure:

```typescript
export const Routes: IRoutes = {
	setup: (app: Express) => {
		// Define your routes here
		app.get('/example', (req: Request, res: Response) => {
			res.send('Hello World!');
		});
	},
};

export const specs = './path-to-your-openapi-spec.yaml';
```

### Environment Variables

Ensure you have a `.env` file in your project root with the following configuration:

```
PORT=8080
```

### Custom Error Handling

You can customize error handling by overwriting the `_setErrorHandler` method.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License.

## Acknowledgments

-   [Express](https://expressjs.com/)
-   [express-openapi-validator](https://github.com/cdimascio/express-openapi-validator)
-   [dotenv](https://github.com/motdotla/dotenv)
