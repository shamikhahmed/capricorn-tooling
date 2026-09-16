import Dexie from 'dexie';
export const db = new Dexie('app');
db.version(1).stores({ friends: '++id,name', pets: '++id,owner' });
