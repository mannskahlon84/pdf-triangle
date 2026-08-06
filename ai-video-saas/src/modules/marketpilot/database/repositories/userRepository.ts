import { User } from "../../auth/types/user.types";

export class UserRepository {
  private static users: Map<string, User> = new Map();

  public static async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  public static async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }
}
