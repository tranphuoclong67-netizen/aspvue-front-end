const BASE_URL = 'http://localhost:5035'

const store = {
    token: null,
    username: null,
    role: null
}

export function saveAuth(token, username, role) {
    store.token = token
    store.username = username
    store.role = role
    try {
        localStorage.setItem('token', token)
        localStorage.setItem('username', username)
        localStorage.setItem('role', role)
    } catch { }
}

export function getAuth() {
    if (store.token) return store
    try {
        return {
            token: localStorage.getItem('token'),
            username: localStorage.getItem('username'),
            role: localStorage.getItem('role')
        }
    } catch { return store }
}

export async function adminDeleteUser(id) {
    await fetch(`${BASE_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    })
}

export async function adminGetStats() {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, { headers: getHeaders() })
    return res.json()
}

export function clearAuth() {
    store.token = null
    store.username = null
    store.role = null
    try { localStorage.clear() } catch { }
}

function getHeaders() {
    const { token } = getAuth()
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
}

// Auth
export async function register(username, password) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    return res.json()
}

export async function login(username, password) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    return res.json()
}

// Short URLs
export async function shortenUrl(originalUrl) {
    const res = await fetch(`${BASE_URL}/api/shorturl`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ originalUrl })
    })
    return res.json()
}

export async function getAllUrls() {
    const res = await fetch(`${BASE_URL}/api/shorturl`, {
        headers: getHeaders()
    })
    return res.json()
}

export async function deleteUrl(id) {
    await fetch(`${BASE_URL}/api/shorturl/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    })
}

// Admin
export async function adminGetAllUsers() {
    const res = await fetch(`${BASE_URL}/api/admin/users`, { headers: getHeaders() })
    return res.json()
}

export async function adminGetAllUrls() {
    const res = await fetch(`${BASE_URL}/api/admin/urls`, { headers: getHeaders() })
    return res.json()
}

export async function adminDeleteUrl(id) {
    await fetch(`${BASE_URL}/api/admin/urls/${id}`, { method: 'DELETE', headers: getHeaders() })
}

export async function adminSetRole(userId, role) {
    const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ role })
    })
    return res.json()
}

export async function getBalance() {
    const res = await fetch(`${BASE_URL}/api/auth/balance`, {
        headers: getHeaders()
    })
    return res.json()
}

// Function to call deposit API
export async function depositApi(data) {
    const res = await fetch(`${BASE_URL}/api/auth/deposit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw { response: { data: result } };
    return result;
}


// Function to call extend link API
export async function extendUrlApi(id, data) {
    const res = await fetch(`${BASE_URL}/api/shorturl/extend/${id}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw { response: { data: result } };
    return result;


}
