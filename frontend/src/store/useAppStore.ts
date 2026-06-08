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

import { create } from 'zustand'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface SimulatorState {
  display: {
    grid: number[][]
  }
  buttons: {
    a: { state: string; pressed: boolean }
    b: { state: string; pressed: boolean }
  }
  sensors: {
    temperature: number
    light_level: number
    accelerometer: { x: number; y: number; z: number }
  }
}

type SensorValue = number | { x: number; y: number; z: number }

interface RawButtonState {
  state?: string
  pressed?: boolean
}

interface RawSimulatorState {
  microbit?: RawSimulatorState
  display?: {
    grid?: number[][]
  }
  buttons?: {
    a?: RawButtonState
    b?: RawButtonState
  }
  sensors?: {
    temperature?: number
    light_level?: number
    accelerometer?: { x: number; y: number; z: number }
  }
}

interface AppState {
  // Session
  sessionId: string | null
  isSessionReady: boolean

  // Simulator state
  simulatorState: SimulatorState

  // Chat
  messages: Message[]
  isStreaming: boolean

  // Code execution
  isExecuting: boolean
  executionOutput: string[]
  executionErrors: string[]

  // Actions
  initSession: () => Promise<void>
  executeCode: (code: string) => Promise<void>
  sendChatMessage: (message: string) => Promise<void>
  pressButton: (button: 'a' | 'b') => Promise<void>
  releaseButton: (button: 'a' | 'b') => Promise<void>
  resetSimulator: () => Promise<void>
  updateSensor: (sensor: string, value: SensorValue) => Promise<void>
}

const initialSimulatorState: SimulatorState = {
  display: {
    grid: Array(5).fill(Array(5).fill(0)),
  },
  buttons: {
    a: { state: 'released', pressed: false },
    b: { state: 'released', pressed: false },
  },
  sensors: {
    temperature: 22,
    light_level: 128,
    accelerometer: { x: 0, y: 0, z: -1024 },
  },
}

const normalizeSimulatorState = (state: RawSimulatorState): SimulatorState => {
  const microbit = state?.microbit ?? state ?? {}
  const buttons = microbit.buttons ?? {}

  return {
    display: {
      grid: microbit.display?.grid ?? initialSimulatorState.display.grid,
    },
    buttons: {
      a: {
        state: buttons.a?.state ?? 'released',
        pressed: buttons.a?.pressed ?? buttons.a?.state === 'pressed',
      },
      b: {
        state: buttons.b?.state ?? 'released',
        pressed: buttons.b?.pressed ?? buttons.b?.state === 'pressed',
      },
    },
    sensors: {
      temperature: microbit.sensors?.temperature ?? initialSimulatorState.sensors.temperature,
      light_level: microbit.sensors?.light_level ?? initialSimulatorState.sensors.light_level,
      accelerometer: microbit.sensors?.accelerometer ?? initialSimulatorState.sensors.accelerometer,
    },
  }
}

const decodeStreamData = (data: string): string => {
  try {
    return JSON.parse(data) as string
  } catch {
    return data
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  sessionId: null,
  isSessionReady: false,
  simulatorState: initialSimulatorState,
  messages: [],
  isStreaming: false,
  isExecuting: false,
  executionOutput: [],
  executionErrors: [],

  initSession: async () => {
    try {
      const response = await axios.post(`${API_BASE}/simulator/session/create`, {
        platform: 'micro:bit',
      })
      const { session_id } = response.data
      set({ sessionId: session_id, isSessionReady: true, simulatorState: initialSimulatorState })
      console.log('✅ Sesión creada:', session_id)
    } catch (error) {
      console.error('❌ Error creando sesión:', error)
    }
  },

  executeCode: async (code: string) => {
    const { sessionId } = get()
    if (!sessionId) {
      console.error('No hay sesión activa')
      return
    }

    set({ isExecuting: true, executionOutput: [], executionErrors: [] })

    try {
      const response = await axios.post(`${API_BASE}/simulator/execute`, {
        session_id: sessionId,
        code,
      })

      const { success, state, error, output_log, error_log } = response.data

      set({
        simulatorState: normalizeSimulatorState(state),
        executionOutput: output_log ?? [],
        executionErrors: success ? (error_log ?? []) : [error, ...(error_log ?? [])].filter(Boolean),
      })
    } catch (error: unknown) {
      console.error('❌ Error ejecutando código:', error)
      const message = axios.isAxiosError(error)
        ? error.response?.data?.detail || 'Error desconocido'
        : 'Error desconocido'
      set({
        executionErrors: [message],
      })
    } finally {
      set({ isExecuting: false })
    }
  },

  sendChatMessage: async (message: string) => {
    const { messages } = get()

    // Add user message
    const userMessage: Message = { role: 'user', content: message }
    set({ messages: [...messages, userMessage], isStreaming: true })

    try {
      // Build request matching backend ChatRequest schema
      const requestBody = {
        message,
        conversation_history: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        platform: 'micro:bit',
        language: 'micropython',
        difficulty: 'beginner',
      }

      const response = await fetch(`${API_BASE}/chat/message/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              continue
            }
            assistantContent += decodeStreamData(data)

            set((state) => {
              const updated = [...state.messages]
              const lastIndex = updated.length - 1
              if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: assistantContent,
                }
              } else {
                updated.push({ role: 'assistant', content: assistantContent })
              }

              return { messages: updated }
            })
          }
        }
      }

      set({ isStreaming: false })
    } catch (error) {
      console.error('❌ Error en chat:', error)
      set({
        messages: [
          ...get().messages,
          {
            role: 'assistant',
            content: 'Lo siento, hubo un error al procesar tu mensaje.',
          },
        ],
        isStreaming: false,
      })
    }
  },

  pressButton: async (button: 'a' | 'b') => {
    const { sessionId } = get()
    if (!sessionId) return

    try {
      await axios.post(`${API_BASE}/simulator/button`, {
        session_id: sessionId,
        button,
        action: 'press',
      })

      // Update local state
      set((state) => ({
        simulatorState: {
          ...state.simulatorState,
          buttons: {
            ...state.simulatorState.buttons,
            [button]: { state: 'pressed', pressed: true },
          },
        },
      }))
    } catch (error) {
      console.error('❌ Error presionando botón:', error)
    }
  },

  releaseButton: async (button: 'a' | 'b') => {
    const { sessionId } = get()
    if (!sessionId) return

    try {
      await axios.post(`${API_BASE}/simulator/button`, {
        session_id: sessionId,
        button,
        action: 'release',
      })

      // Update local state
      set((state) => ({
        simulatorState: {
          ...state.simulatorState,
          buttons: {
            ...state.simulatorState.buttons,
            [button]: { state: 'released', pressed: false },
          },
        },
      }))
    } catch (error) {
      console.error('❌ Error liberando botón:', error)
    }
  },

  resetSimulator: async () => {
    const { sessionId } = get()
    if (!sessionId) return

    try {
      const response = await axios.post(`${API_BASE}/simulator/session/${sessionId}/reset`)
      set({ simulatorState: normalizeSimulatorState(response.data.state) })
    } catch (error) {
      console.error('❌ Error reseteando simulador:', error)
    }
  },

  updateSensor: async (sensor: string, value: SensorValue) => {
    const { sessionId } = get()
    if (!sessionId) return

    try {
      await axios.post(`${API_BASE}/simulator/sensor`, {
        session_id: sessionId,
        sensor,
        value,
      })

      // Update local state based on sensor type
      set((state) => ({
        simulatorState: {
          ...state.simulatorState,
          sensors: {
            ...state.simulatorState.sensors,
            [sensor]: value,
          },
        },
      }))
    } catch (error) {
      console.error('❌ Error actualizando sensor:', error)
    }
  },
}))
