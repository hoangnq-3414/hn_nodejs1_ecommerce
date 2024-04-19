/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import express from 'express';
import { container, injectable, singleton } from 'tsyringe';
import { HttpMethod } from '../enum/http.method.enum';
import { Request, Response, NextFunction } from 'express';
import { StatusEnum } from '../enum/status.enum';
import { ClassConstructor } from '../declare/class.constructor';
import { Logger } from '../config/logger';

function errorHandler(
  err: any,
  req: Request,
  res: Response,
) {
  switch (err.status) {
    case StatusEnum.NOT_FOUND:
      res.status(StatusEnum.NOT_FOUND).json({
        status: StatusEnum.NOT_FOUND,
        message: err.message,
      });
      break;
    case StatusEnum.BAD_REQUEST:
      res.status(StatusEnum.BAD_REQUEST).json({
        status: StatusEnum.BAD_REQUEST,
        message: err.message,
      });
      break;
    case StatusEnum.FORBIDDEN:
      res.status(StatusEnum.FORBIDDEN).json({
        status: StatusEnum.FORBIDDEN,
        message: err.message,
      });
      break;
    case StatusEnum.INTERNAL_ERROR:
      res.status(StatusEnum.INTERNAL_ERROR).json({
        status: StatusEnum.INTERNAL_ERROR,
        message: err.message,
      });
      break;
    default:
      Logger.error(err);
      res.status(StatusEnum.INTERNAL_ERROR).json({
        status: StatusEnum.INTERNAL_ERROR,
        message: 'Internal Server Error',
      });
      break;
  }
}

export function RestConfig<T extends ClassConstructor>(
  controllers: ClassConstructor[],
) {
  return function decorator(constructor: T) {
    singleton()(constructor);
    const rootRoute: any = container.resolve(constructor);
    controllers.forEach((controller) => {
      rootRoute
        .getRouter()
        .use(
          controller.prototype.path,
          controller.prototype.route,
          errorHandler,
        );
    });
  };
}


export function RestController<T extends ClassConstructor>(path: string) {
  return function decorator(constructor: T) {
    injectable()(constructor);

    constructor.prototype.route = express.Router();
    constructor.prototype.path = path;
    const controller = container.resolve(constructor);

    Object.values(constructor.prototype.mapping).forEach((obj: any) => {
      const { path: _path, method, handlers } = obj;
      const newHandler = async function (
        req: Request,
        res: Response,
        next: NextFunction,
      ) {
        try {
          const obj = await handlers[0].call(controller, req, res, next);
          const status =
            req.method == HttpMethod.POST ? StatusEnum.CREATED : StatusEnum.OK;
          res.status(status).json(obj);
        } catch (error) {
          next(error);
        }
      };
      const [oldHandler, ...restHandlers] = handlers;
      constructor.prototype.route[`${method.toLowerCase()}`](_path, [
        ...restHandlers?.reverse(),
        newHandler,
      ]);
    });
  };
}

export function RequestMapping(path: string, method?: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    method = method ? method.toUpperCase() : HttpMethod.GET;
    const handler = descriptor.value;

    if (!target.constructor.prototype.mapping) {
      target.constructor.prototype.mapping = {};
    }

    target.constructor.prototype.mapping[propertyName] = {
      path,
      method,
      handlers: [],
    };

    target.constructor.prototype.mapping[propertyName].handlers.push(handler);
  };
}

export function GetMapping(path: string) {
  return RequestMapping(path, 'GET');
}

export function PostMapping(path: string) {
  return RequestMapping(path, 'POST');
}

export function PutMapping(path: string) {
  return RequestMapping(path, 'PUT');
}

export function PatchMapping(path: string) {
  return RequestMapping(path, 'PATCH');
}

export function DeleteMapping(path: string) {
  return RequestMapping(path, 'DELETE');
}

