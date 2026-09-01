import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket | null {
	if (typeof window === 'undefined') return null

	const url = process.env.NEXT_PUBLIC_API_BASE_URL
	if (!url) return null

	if (!socket) {
		socket = io(url, {
			autoConnect: false,
			withCredentials: true,
			transports: ['websocket', 'polling'],
		})
	}

	return socket
}
