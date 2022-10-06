import { Request, Response, NextFunction } from 'express';

export interface IController {
    execute( request: Request<any>, response: Response, next?: NextFunction ): Promise<unknown>;
}