import colors from 'colors';
import { buildAfterTest } from '../Build/buildAfterTest';
import { createDependencyMap } from '../Create/createDependencyMap';
import { createPackageMap } from '../Create/createPackageMap';
import { createPackagePublishOrder } from '../Create/createPackagePublishOrder';
import { updatePatchVersion } from '../Update/updatePatchVersion';
import { publishPackages } from './publishPackages';

export async function publishUpdatedPackages (updated_packages_name: string[]) {
	const packages_map = await createPackageMap(),
		package_dependency_map = createDependencyMap(updated_packages_name, packages_map),
		rearranged_packages = createPackagePublishOrder(Array.from(package_dependency_map.all.keys()), packages_map);
	console.log(colors.blue.bold(`Publishing packages\n\n${rearranged_packages.join('\n')}`));

	const rearranged_packages_map = updatePatchVersion(rearranged_packages, packages_map, 1);
	await buildAfterTest(rearranged_packages);
	await publishPackages(rearranged_packages_map);
}
