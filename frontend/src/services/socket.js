
import { io } from 'socket.io-client'

const apiUrl =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api'

const socketUrl =
  apiUrl.replace(/\/api\/?$/, '')

const socket = io(socketUrl, {
  withCredentials: true
})

export default socket

