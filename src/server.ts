import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import config from './config/env';
import { SalesFactory } from './factories/sales-factory';
import router from './routes';

const app: Express = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

app.use(router);

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const salesJob = SalesFactory.makeJob();
salesJob.start();

const PORT = config.PORT;
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const gracefulShutdown = () => {
  console.log('Encerrando aplicação...');
  salesJob.stop(); // Cancela o timer/setInterval
  server.close(() => {
    console.log('Servidor HTTP encerrado.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown); // Captura o Ctrl+C no terminal
