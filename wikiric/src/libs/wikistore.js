import { openDB } from 'idb'
import { toRaw } from 'vue'

const dbPromise = openDB('wikiric-database', 1, {
  upgrade (db) {
    db.createObjectStore('sessions')
    db.createObjectStore('timestamps')
    db.createObjectStore('users')
    db.createObjectStore('data')
  }
})

export async function dbGetSession (key) {
  return (await dbPromise).get('sessions', key)
}

export async function dbSetSession (key, val) {
  return (await dbPromise).put('sessions', toRaw(val), key)
}

export async function dbDeleteSession (key) {
  return (await dbPromise).delete('sessions', key)
}

export async function dbGetTimestamp (key) {
  return (await dbPromise).get('timestamps', key)
}

export async function dbSetTimestamp (key, val) {
  return (await dbPromise).put('timestamps', toRaw(val), key)
}

export async function dbRemoveGroup (key) {
  return (await dbPromise).delete('sessions', key)
}

export async function dbClearGroups () {
  return (await dbPromise).clear('sessions')
}

export async function dbGetGroupKeys () {
  return (await dbPromise).getAllKeys('sessions')
}

export async function dbGetGroups () {
  return (await dbPromise).getAll('sessions')
}

export async function dbGetUsernames () {
  return (await dbPromise).getAllKeys('users')
}

export async function dbGetDisplayName (key) {
  return (await dbPromise).get('users', key)
}

export async function dbSetDisplayName (key, val) {
  return (await dbPromise).put('users', toRaw(val), key)
}

export async function dbGetData (key) {
  return (await dbPromise).get('data', key)
}

export async function dbSetData (key, val) {
  return (await dbPromise).put('data', toRaw(val), key)
}

export async function dbDelData (key) {
  return (await dbPromise).delete('data', key)
}

export async function dbGetAllDataKeys () {
  return (await dbPromise).getAllKeys('data')
}
