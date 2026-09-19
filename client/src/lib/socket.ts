import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket | null {
	if (typeof window === 'undefined') return null

	const url = process.env.NEXT_PUBLIC_API_BASE_URL
	if (!url) return null

	if (!socket) {
		const isRelativeUrl = url.startsWith('/')
		const socketUrl = isRelativeUrl ? window.location.origin : url
		const socketPath = isRelativeUrl
			? `${url.replace(/\/$/, '')}/socket.io`
			: '/socket.io'

		socket = io(socketUrl, {
			autoConnect: false,
			withCredentials: true,
			transports: ['websocket', 'polling'],
			path: socketPath,
		})
	}

	return socket
}

export function disconnectSocket() {
	socket?.disconnect()
}
