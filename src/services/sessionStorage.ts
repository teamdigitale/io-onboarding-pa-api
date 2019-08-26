import { Either, left, right } from "fp-ts/lib/Either";
import { none, Option, some } from "fp-ts/lib/Option";
import { Op } from "sequelize";
import { Session } from "../models/Session";
import { User } from "../models/User";
import { SpidLoggedUser, SpidUser } from "../types/spidUser";
import { SessionToken } from "../types/token";

export const sessionNotFoundError = new Error("Session not found");

export default class SessionStorage {
  public static async set(
    user: SpidUser,
    sessionToken: SessionToken,
    tokenDurationInSeconds: number
  ): Promise<Option<Error>> {
    try {
      const [loggerUser, _] = await User.findOrCreate({
        defaults: {
          email: user.email,
          familyName: user.familyName,
          firstName: user.name
        },
        where: { fiscalCode: user.fiscalNumber }
      });
      await loggerUser.createSession({
        expirationTime: new Date(Date.now() + tokenDurationInSeconds * 1000),
        token: sessionToken
      });
    } catch (error) {
      return some<Error>(new Error("Error creating session for the user"));
    }
    return none;
  }

  public static async getBySessionToken(
    token: SessionToken
  ): Promise<Either<Error, User>> {
    try {
      const user = await User.findOne({
        include: [{ as: "sessions", model: Session, where: { token } }]
      });
      if (user === null) {
        return left<Error, User>(sessionNotFoundError);
      }
      return right<Error, User>(user);
    } catch (error) {
      return left<Error, User>(error);
    }
  }

  public static async del(
    sessionToken: SessionToken
  ): Promise<Either<Error, boolean>> {
    try {
      const session = await Session.findOne({ where: { token: sessionToken } });
      if (!session) {
        return left<Error, boolean>(sessionNotFoundError);
      }
      await session.destroy();
      return right<Error, boolean>(true);
    } catch (error) {
      return left<Error, boolean>(new Error("Error deleting the token"));
    }
  }

  public static async listUserActiveSessions(
    user: SpidLoggedUser
  ): Promise<Either<Error, ReadonlyArray<Session>>> {
    try {
      const userWithSessions = await User.findOne({
        include: [
          {
            as: "sessions",
            model: Session,
            where: {
              deletedAt: null,
              expirationTime: {
                [Op.lt]: new Date()
              }
            }
          }
        ],
        where: {
          fiscalCode: user.fiscalCode
        }
      });
      if (!userWithSessions) {
        return left(new Error("User not found"));
      }
      return right(userWithSessions.sessions ? userWithSessions.sessions : []);
    } catch (error) {
      return left(error);
    }
  }
}
