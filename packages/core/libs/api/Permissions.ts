import { NotionQueries } from '@nishans/endpoints';
import { deepMerge } from '@nishans/fabricator';
import { NotionOperationsObject, Operation } from '@nishans/operations';
import {
	IOperation,
	IPermission,
	IPublicPermission,
	IPublicPermissionOptions,
	IUserPermission,
	TDataType,
	TPage,
	TPermissionRole,
	TPublicPermissionRole,
	TSpacePermissionRole,
	TUserPermissionRole
} from '@nishans/types';
import { NishanArg } from '../';
import Data from './Data';

interface UserIdentifier {
	id?: string;
	email?: string;
}

export default class NotionPermissions extends Data<TPage> {
	constructor (arg: NishanArg, id: string, type: TDataType) {
		super({ ...arg, id, type });
	}

	async getNotionUserIdFromEmail ({ email, id }: UserIdentifier) {
		let user_id = id;
		if (email) {
			const { value } = await NotionQueries.findUser({ email }, this.getConfigs());
			if (!value) throw new Error(`User does not have a notion account`);
			else user_id = value.value.id;
		}
		return user_id as string;
	}

	updatePermissionsArray (
		permission_type: 'public_permission' | 'space_permission',
		options: { role: TPermissionRole } & Partial<IPublicPermissionOptions>
	): IOperation;
	updatePermissionsArray (
		permission_type: 'user_permission',
		options: { role: TPermissionRole },
		user_id: string
	): IOperation;
	updatePermissionsArray (
		permission_type: IPermission['type'],
		options: { role: TPermissionRole } & Partial<IPublicPermissionOptions>,
		user_id?: string
	): IOperation {
		let permission_data: IPermission = {} as any,
			operation: IOperation = undefined as any;
		if (permission_type === 'public_permission' || permission_type === 'space_permission')
			permission_data = { ...options, type: permission_type } as IPublicPermission;
		else permission_data = { role: options.role, type: permission_type, user_id } as IUserPermission;
		operation = Operation.block.setPermissionItem(this.id, [ 'permissions' ], permission_data);
		const { permissions } = this.getCachedData();
		const permission_index = permissions.findIndex((permission) => {
			if (permission_type === 'public_permission' || permission_type === 'space_permission')
				return permission.type === permission_type;
			else return permission.type === permission_type && permission.user_id === user_id;
		});
		if (options.role === 'none') permissions.splice(permission_index, 1);
		else if (permissions[permission_index]) deepMerge(permissions[permission_index], options);
		else permissions.push(permission_data);
		return operation;
	}

	async addUserPermission (id: UserIdentifier, role: TUserPermissionRole) {
		await this.addUserPermissions([ [ id, role ] ]);
	}

	/**
   * Share page to users with specific permissions
   * @param args array of user id and role of user to share pages to
   */
	async addUserPermissions (args: [UserIdentifier, TUserPermissionRole][]) {
		await this.updateUserPermissions(args);
	}

	/**
   * Update the role of the current user based on their id
   * @param id Id of the user to update
   * @param role new Role of the user to update
   */
	async updateUserPermission (id: UserIdentifier, role: TUserPermissionRole) {
		await this.updateUserPermissions([ [ id, role ] ]);
	}

	/**
   * Update the role of the current users based on their id
   * @param args array of array [id of the user, role type for the user]
   */
	async updateUserPermissions (args: [UserIdentifier, TUserPermissionRole][]) {
		const operations: IOperation[] = [];
		for (let index = 0; index < args.length; index++) {
			const [ arg, role ] = args[index];
			const user_id = await this.getNotionUserIdFromEmail(arg);
			operations.push(this.updatePermissionsArray('user_permission', { role }, user_id));
		}
		this.logger && this.logger('UPDATE', 'block', this.id);
		await NotionOperationsObject.executeOperations(
			[ ...operations, Operation[this.type].update(this.id, [], this.updateLastEditedProps()) ],
			this.getProps()
		);
	}

	/**
   * Remove a single user from the pages permission option
   * @param id Id of the user to remove from permission
   */
	async removeUserPermission (id: UserIdentifier) {
		await this.removeUserPermissions([ id ]);
	}

	/**
   * Remove multiple users from the pages permission option
   * @param id array of the users id to remove from permission
   */
	async removeUserPermissions (ids: UserIdentifier[]) {
		await this.updateUserPermissions(ids.map((id) => [ id, 'none' ]));
	}

	async updateNonUserSpecificPermission (
		permission_type: 'public_permission',
		options: { role: TPublicPermissionRole } & Partial<IPublicPermissionOptions>
	): Promise<void>;
	async updateNonUserSpecificPermission (
		permission_type: 'space_permission',
		options: { role: TSpacePermissionRole }
	): Promise<void>;
	async updateNonUserSpecificPermission (
		permission_type: 'public_permission' | 'space_permission',
		options: { role: TPublicPermissionRole | TSpacePermissionRole } & Partial<IPublicPermissionOptions>
	): Promise<void> {
		this.logger && this.logger('UPDATE', 'block', this.id);
		await NotionOperationsObject.executeOperations(
			[
				this.updatePermissionsArray(permission_type, options as IPublicPermission),
				Operation[this.type].update(this.id, [], this.updateLastEditedProps())
			],
			this.getProps()
		);
	}

	async addPublicPermission (options: { role: TPublicPermissionRole } & Partial<IPublicPermissionOptions>) {
		await this.updatePublicPermission({
			allow_duplicate: true,
			allow_search_engine_indexing: true,
			...options
		});
	}

	async updatePublicPermission (options: { role: TPublicPermissionRole } & Partial<IPublicPermissionOptions>) {
		await this.updateNonUserSpecificPermission('public_permission', options);
	}

	async removePublicPermission () {
		await this.updatePublicPermission({ role: 'none' });
	}

	async updateSpacePermission (role: TSpacePermissionRole) {
		await this.updateNonUserSpecificPermission('space_permission', { role });
	}

	async removeSpacePermission () {
		await this.updateSpacePermission('none');
	}
}
