const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

async function readApiResponse(response) {
  const body = await response.text()
  let result = {}

  if (body) {
    try {
      result = JSON.parse(body)
    } catch {
      if (response.status === 502 || response.status === 503) {
        throw new Error(
          'The backend is unavailable. Start the backend server on port 3000 and try again.',
        )
      }

      throw new Error(
        `The server returned an invalid response (${response.status} ${response.statusText}).`,
      )
    }
  }

  if (!response.ok) {
    if (response.status === 502 || response.status === 503) {
      throw new Error(
        'The backend is unavailable. Start the backend server on port 3000 and try again.',
      )
    }

    throw new Error(
      result.message ||
        `The request failed (${response.status} ${response.statusText}).`,
    )
  }

  return result
}

export async function getApi(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
  })
  return readApiResponse(response)
}

export async function postApi(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  return readApiResponse(response)
}

export async function postFormApi(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body,
  })
  return readApiResponse(response)
}

export async function patchFormApi(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    credentials: 'include',
    body,
  })
  return readApiResponse(response)
}

export async function deleteApi(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return readApiResponse(response)
}
