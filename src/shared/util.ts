/**
 * @export
 * @param {*} sourceVersion
 * @param {*} targetVersion
 * @return {*} Boolean
 */
export function compareVersions(sourceVersion, targetVersion) {
  const v1 = sourceVersion.split('.').map(Number);
  const v2 = targetVersion.split('.').map(Number);

  const maxLength = Math.max(v1.length, v2.length);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < maxLength; i++) {
    const num1 = i < v1.length ? v1[i] : 0;
    const num2 = i < v2.length ? v2[i] : 0;
    if (num1 < num2) {
      return false;
    }
    if (num1 > num2) {
      return true;
    }
  }

  return true;
}
