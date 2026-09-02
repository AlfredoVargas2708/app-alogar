import axios from 'axios'

const apiToken =
  import.meta.env.VITE_API_TOKEN ??
  'a10ca26e0f94f01e6001c0044f305f5c7387a9adf3cfeedfa15f09aa08ab11ae'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiToken}`,
  },
})

export default api
