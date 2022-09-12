import { ValidationError } from 'yup';

export type PickedValidationError =
  | Pick<ValidationError, 'message' | 'path'>
  | {
      message: ValidationError['message'];
      path: null;
    };

export class HttpException extends Error {
  public status: number;
  public message: string;
  public errors?: PickedValidationError[];

  constructor(status: number, message: string, errors?: PickedValidationError[]) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;
  }
}

import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`);

const env = process.env.NODE_ENV || 'development';

const logger = winston.createLogger({
  format: combine(
    colorize(),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat,
  ),
  transports: [new winston.transports.Console({ silent: env == 'test' })],
});

export default logger;


export const UuidRegex = '[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}';



import { Router } from 'express';

export type Environment = 'development' | 'test' | 'production';

export interface Route {
  path?: string;
  router: Router;

  makeRoute(route: string): void;
  initializeRoutes(): void;
}

export interface Service {}

export interface CrudService<T, CreateDto> extends Service {
  findAll(): Promise<T[]>;
  findOneById(id: string): Promise<T | null>;
  create(data: CreateDto): Promise<T>;
  update?(id: string, data: CreateDto): Promise<T | null>;
  delete?(id: string): Promise<T>;
}
