/*
 * Copyright (C) 2024-2025 EDUmind - Los Mundos Edufis
 * Author: Luis Vilela Acuña
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useEffect, useRef, useCallback, useState } from 'react'

interface WebSocketMessage {
    type: string
    data: unknown
}

interface UseWebSocketOptions {
    sessionId: string | null
    onSensorUpdate?: (data: unknown) => void
    onDisplayUpdate?: (data: unknown) => void
    onExecutionOutput?: (data: { output: string; is_error: boolean }) => void
}

export const useWebSocket = ({
    sessionId,
    onSensorUpdate,
    onDisplayUpdate,
    onExecutionOutput
}: UseWebSocketOptions) => {
    const wsRef = useRef<WebSocket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const reconnectTimeoutRef = useRef<number | null>(null)

    const connect = useCallback(() => {
        if (!sessionId) return

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${protocol}//${window.location.host}/api/ws/${sessionId}`

        try {
            const ws = new WebSocket(wsUrl)

            ws.onopen = () => {
                console.log('WebSocket connected')
                setIsConnected(true)

                if (reconnectTimeoutRef.current !== null) {
                    window.clearTimeout(reconnectTimeoutRef.current)
                }
            }

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data)

                    switch (message.type) {
                        case 'sensor_update':
                            onSensorUpdate?.(message.data)
                            break
                        case 'display_update':
                            onDisplayUpdate?.(message.data)
                            break
                        case 'execution_output':
                            onExecutionOutput?.(message.data as { output: string; is_error: boolean })
                            break
                    }
                } catch (e) {
                    console.error('WebSocket parse error:', e)
                }
            }

            ws.onclose = () => {
                console.log('WebSocket disconnected')
                setIsConnected(false)

                reconnectTimeoutRef.current = window.setTimeout(() => {
                    connect()
                }, 3000)
            }

            ws.onerror = (error) => {
                console.error('WebSocket error:', error)
            }

            wsRef.current = ws
        } catch (e) {
            console.error('WebSocket connection error:', e)
        }
    }, [sessionId, onSensorUpdate, onDisplayUpdate, onExecutionOutput])

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current !== null) {
            window.clearTimeout(reconnectTimeoutRef.current)
        }
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }
        setIsConnected(false)
    }, [])

    const sendMessage = useCallback((type: string, data: unknown) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, data }))
        }
    }, [])

    useEffect(() => {
        connect()

        const heartbeatInterval = window.setInterval(() => {
            sendMessage('ping', {})
        }, 30000)

        return () => {
            window.clearInterval(heartbeatInterval)
            disconnect()
        }
    }, [connect, disconnect, sendMessage])

    return {
        isConnected,
        sendMessage,
        reconnect: connect
    }
}
