const prefix = 'fitplan.';
function scopedKey(key: string) {
  if (!key.startsWith(prefix)) return key;
  const userId = sessionStorage.getItem('fitplan.activeUserId');
  return userId ? `fitplan.user.${userId}.${key.slice(prefix.length)}` : key;
}
export function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(scopedKey(key));
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(scopedKey(key), JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('fitplan:storage-changed'));
  } catch (error) {
    console.error('Não foi possível salvar os dados localmente.', error);
  }
}
export function setActiveUserId(id: string | null) {
  if (id) sessionStorage.setItem('fitplan.activeUserId', id);
  else sessionStorage.removeItem('fitplan.activeUserId');
}
export function exportUserData() {
  return Object.fromEntries(['profile.v1','logs.v1','music.v1','progress.v1','water.v1']
    .map((suffix) => [suffix, readStorage('fitplan.' + suffix, null)]));
}
export function importUserData(data: Record<string, unknown>) {
  for (const suffix of ['profile.v1','logs.v1','music.v1','progress.v1','water.v1']) {
    if (data[suffix] !== undefined && data[suffix] !== null) {
      localStorage.setItem(scopedKey('fitplan.' + suffix), JSON.stringify(data[suffix]));
    }
  }
}
