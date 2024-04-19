// import { inject } from 'tsyringe';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import {
  GetMapping,
  RestController,
} from './rest.api.decorator';
import { Request, Response } from 'express';
const userRepository = AppDataSource.getRepository(User);

@RestController('/api/user')
class UserController {
  constructor(
    // @inject(ReviewService)
    // private readonly reviewService: ReviewService,
  ) {}

  @GetMapping('/')
  public async findUser(
    req: Request,
    res: Response,
  ) {
    const user = await userRepository.find();
    res.json(user);
  }
}

export default new UserController();
