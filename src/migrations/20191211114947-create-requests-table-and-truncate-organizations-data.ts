import { DataTypes, QueryInterface } from "sequelize";
import { OrganizationScopeEnum } from "../generated/OrganizationScope";
import { RequestStatusEnum } from "../generated/RequestStatus";
import { UserRoleEnum } from "../generated/UserRole";
import { RequestType } from "../models/Request";

export function up(queryInterface: QueryInterface): Promise<unknown> {
  return queryInterface.sequelize.transaction(transaction => {
    return queryInterface
      .createTable(
        "Requests",
        {
          createdAt: {
            allowNull: false,
            type: new DataTypes.DATE()
          },
          deletedAt: {
            allowNull: true,
            type: new DataTypes.DATE()
          },
          documentId: {
            allowNull: true,
            type: new DataTypes.STRING(),
            unique: true
          },
          id: {
            autoIncrement: true,
            primaryKey: true,
            type: new DataTypes.INTEGER()
          },
          legalRepresentativeFamilyName: {
            allowNull: true,
            type: new DataTypes.STRING()
          },
          legalRepresentativeFiscalCode: {
            allowNull: true,
            type: new DataTypes.STRING()
          },
          legalRepresentativeGivenName: {
            allowNull: true,
            type: new DataTypes.STRING()
          },
          legalRepresentativePhoneNumber: {
            allowNull: true,
            type: new DataTypes.STRING()
          },
          organizationFiscalCode: {
            allowNull: true,
            type: new DataTypes.STRING()
          },
          organizationIpaCode: {
            allowNull: true,
            type: new DataTypes.STRING()
          },
          organizationName: {
            allowNull: true,
            type: new DataTypes.STRING()
          },
          organizationPec: {
            allowNull: true,
            type: new DataTypes.STRING()
          },
          organizationScope: {
            allowNull: true,
            type: new DataTypes.ENUM(...Object.values(OrganizationScopeEnum))
          },
          status: {
            allowNull: false,
            defaultValue: RequestStatusEnum.CREATED,
            type: new DataTypes.ENUM(...Object.values(RequestStatusEnum))
          },
          type: {
            allowNull: false,
            type: new DataTypes.ENUM(...Object.values(RequestType))
          },
          updatedAt: {
            allowNull: false,
            type: new DataTypes.DATE()
          },
          userEmail: {
            references: {
              key: "email",
              model: "Users"
            },
            type: new DataTypes.STRING()
          }
        },
        { transaction }
      )
      .then(() =>
        queryInterface.bulkDelete("OrganizationsUsers", {}, { transaction })
      )
      .then(() =>
        queryInterface.bulkDelete("Organizations", {}, { transaction })
      )
      .then(() =>
        queryInterface.bulkDelete(
          "Users",
          { role: UserRoleEnum.ORG_MANAGER },
          { transaction }
        )
      );
  });
}

export function down(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.dropTable("Organizations");
}