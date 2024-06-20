import * as express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import type * as http from 'http';
import { Connections } from './connections';
import { middleware } from 'express-openapi-validator';
import * as dotenv from 'dotenv';
dotenv.config();

declare const bimport: (module: string) => Promise<any>;

const PORT = process.env.PORT || 8080;

export /*bundle*/ interface IRoutes {
	setup: (app: Express) => void;
}

interface IHMR {
	on: (event: string, listener: () => any) => void;
	off: (event: string, listener: () => any) => void;
}

export /*bundle*/ class Server {
	private _app: Express;
	private _server: http.Server;
	private _connections: Connections;
	private _port = PORT;
	private _Routes: IRoutes;
	private _hmr: IHMR;
	private _specs: string;

	start(module: string) {
		bimport(module)
			.then(({ Routes, specs, hmr }: { Routes: IRoutes; specs: string; hmr: IHMR }) => {
				this._Routes = Routes;
				this._hmr = hmr;
				this._specs = specs;

				this._setup();
			})
			.catch((exc: Error) => console.error(`Error importing module "${module}": ${exc.message}`));
	}

	_setup() {
		try {
			this._app = express();
			this._app.use(express.json());
			this._setHeader();

			// Setup middleware for OpenAPI specs validation
			this._specs && this._app.use(middleware({ apiSpec: this._specs }));

			// Setup custom error handler
			this._setErrorHandler(this._app);

			// Setup the routes
			this._Routes.setup(this._app);

			//subscription to listen routes module changes.
			this._hmr.on('change', this.onChange);

			this._server = this._app.listen(this._port, () => {
				console.log(`HTTP API Server port:  "${this._port}"`);
			});

			this._connections = new Connections(this._server);
		} catch (exc) {
			console.error('Error', exc);
		}
	}

	_setErrorHandler(app: Express) {
		app.use((error: any, req: Request, res: Response, next: NextFunction) => {
			if (!error) return next();
			res.status(error.status || 500).json({ message: error.message, errors: error.errors });
		});
	}

	_setHeader() {
		this._app.use((req, res, next) => {
			res.header('Access-Control-Allow-Origin', '*');
			res.header(
				'Access-Control-Allow-Headers',
				'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method'
			);
			res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
			res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
			next();
		});
	}

	onChange = () => {
		this._connections.destroy();
		this._server.close(() => {
			this._hmr.off('change', this.onChange);
			this._setup();
		});
	};
}
