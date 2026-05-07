const ENCRYPTION_KEY_NAME = 'nova_device_key'

async function getDeviceKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(ENCRYPTION_KEY_NAME)
  if (stored) {
    const keyData = Uint8Array.from(atob(stored), c => c.charCodeAt(0))
    return crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
  }
  const keyData = crypto.getRandomValues(new Uint8Array(32))
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, true, ['encrypt', 'decrypt'])
  const exported = await crypto.subtle.exportKey('raw', key)
  localStorage.setItem(ENCRYPTION_KEY_NAME, btoa(String.fromCharCode(...new Uint8Array(exported))))
  return key
}

export async function encryptValue(plaintext: string): Promise<string> {
  if (!plaintext) return ''
  try {
    const key = await getDeviceKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(plaintext)
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
    const combined = new Uint8Array(iv.length + ciphertext.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(ciphertext), iv.length)
    return btoa(String.fromCharCode(...combined))
  } catch {
    return plaintext
  }
}

export async function decryptValue(ciphertext: string): Promise<string> {
  if (!ciphertext) return ''
  try {
    const key = await getDeviceKey()
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    return new TextDecoder().decode(decrypted)
  } catch {
    return ciphertext
  }
}

export function encryptSync(value: string): string {
  if (!value) return ''
  const key = localStorage.getItem(ENCRYPTION_KEY_NAME)
  if (!key) return value
  const keyBytes = Uint8Array.from(atob(key), c => c.charCodeAt(0))
  const valueBytes = new TextEncoder().encode(value)
  const result = new Uint8Array(valueBytes.length)
  for (let i = 0; i < valueBytes.length; i++) {
    result[i] = valueBytes[i] ^ keyBytes[i % keyBytes.length]
  }
  return 'enc:' + btoa(String.fromCharCode(...result))
}

export function decryptSync(value: string): string {
  if (!value || !value.startsWith('enc:')) return value
  try {
    const key = localStorage.getItem(ENCRYPTION_KEY_NAME)
    if (!key) return value
    const keyBytes = Uint8Array.from(atob(key), c => c.charCodeAt(0))
    const data = Uint8Array.from(atob(value.slice(4)), c => c.charCodeAt(0))
    const result = new Uint8Array(data.length)
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ keyBytes[i % keyBytes.length]
    }
    return new TextDecoder().decode(result)
  } catch {
    return value
  }
}

function initDeviceKey(): void {
  if (!localStorage.getItem(ENCRYPTION_KEY_NAME)) {
    const keyData = crypto.getRandomValues(new Uint8Array(32))
    localStorage.setItem(ENCRYPTION_KEY_NAME, btoa(String.fromCharCode(...keyData)))
  }
}

initDeviceKey()
