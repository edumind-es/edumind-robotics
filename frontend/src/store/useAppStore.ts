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

  /* Makey Makey: sesión propia, porque el laboratorio usa una de micro:bit y
     el backend crea un simulador distinto por plataforma. */
  makeySessionId: string | null
  makeyPins: MakeyPins

  /* Nezha: igual que Makey, sesión propia porque el backend crea un
     simulador distinto según la plataforma. */
  nezhaSessionId: string | null
  nezhaState: NezhaState

  // Actions
  initSession: () => Promise<void>
  initMakeySession: () => Promise<void>
  touchPin: (pin: number) => Promise<void>
  releasePin: (pin: number) => Promise<void>
  initNezhaSession: () => Promise<void>
  setMotor: (motor: string, speed: number) => Promise<void>
  setServo: (servo: string, angle: number) => Promise<void>
  executeCode: (code: string) => Promise<void>
  sendChatMessage: (message: string) => Promise<void>
  pressButton: (button: 'a' | 'b') => Promise<void>
  releaseButton: (button: 'a' | 'b') => Promise<void>
  resetSimulator: () => Promise<void>
  updateSensor: (sensor: string, value: SensorValue) => Promise<void>
}

export interface NezhaState {
  motors: { m1: number; m2: number; m3: number; m4: number }
  servos: { s1: number; s2: number }
  sensors: { ultrasonic: number; line_follower: boolean[]; color: string }
}

const initialNezhaState: NezhaState = {
  motors: { m1: 0, m2: 0, m3: 0, m4: 0 },
  servos: { s1: 90, s2: 90 },
  sensors: { ultrasonic: 100, line_follower: [false, false], color: 'none' },
}

/*
 * El simulador indexa motores y servos por número y el sensor de línea por
 * nombre; el componente los espera como m1..m4, s1..s2 y una pareja de
 * booleanos. Aquí se traduce, en un solo sitio.
 */
interface NezhaEstadoCrudo {
  motors?: Record<number, { speed?: number }>
  servos?: Record<number, { angle?: number }>
  sensors?: {
    ultrasonic?: { distance?: number }
    line?: { left?: number; center?: number; right?: number }
    color?: { r?: number; g?: number; b?: number }
  }
}

function adaptarNezha(estado: NezhaEstadoCrudo | undefined): NezhaState {
  const motores = estado?.motors ?? {}
  const servos = estado?.servos ?? {}
  const sensores = estado?.sensors ?? {}
  const linea = sensores.line ?? {}
  const color = sensores.color ?? {}
  const hayColor = (color.r ?? 0) + (color.g ?? 0) + (color.b ?? 0) > 0

  return {
    motors: {
      m1: motores[1]?.speed ?? 0,
      m2: motores[2]?.speed ?? 0,
      m3: motores[3]?.speed ?? 0,
      m4: motores[4]?.speed ?? 0,
    },
    servos: {
      s1: servos[1]?.angle ?? 90,
      s2: servos[2]?.angle ?? 90,
    },
    sensors: {
      ultrasonic: sensores.ultrasonic?.distance ?? 100,
      line_follower: [Boolean(linea.left), Boolean(linea.right)],
      color: hayColor ? `rgb(${color.r}, ${color.g}, ${color.b})` : 'none',
    },
  }
}

export type MakeyPins = Record<
  number,
  { state: string; is_touched: boolean; touch_count: number }
>

/* Los tres pines táctiles que expone el simulador (la banana, la fruta...). */
const initialMakeyPins: MakeyPins = {
  0: { state: 'released', is_touched: false, touch_count: 0 },
  1: { state: 'released', is_touched: false, touch_count: 0 },
  2: { state: 'released', is_touched: false, touch_count: 0 },
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
  makeySessionId: null,
  makeyPins: initialMakeyPins,
  nezhaSessionId: null,
  nezhaState: initialNezhaState,
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

  initMakeySession: async () => {
    if (get().makeySessionId) return
    try {
      const response = await axios.post(`${API_BASE}/simulator/session/create`, {
        platform: 'makey_makey',
      })
      set({ makeySessionId: response.data.session_id, makeyPins: initialMakeyPins })
    } catch (error) {
      console.error('❌ Error creando sesión de Makey Makey:', error)
    }
  },

  touchPin: async (pin: number) => {
    const { makeySessionId } = get()
    if (!makeySessionId) return
    try {
      const response = await axios.post(`${API_BASE}/simulator/touch`, {
        session_id: makeySessionId,
        pin,
        action: 'touch',
      })
      set({ makeyPins: response.data.state.pins })
    } catch (error) {
      console.error('❌ Error tocando el pin:', error)
    }
  },

  releasePin: async (pin: number) => {
    const { makeySessionId } = get()
    if (!makeySessionId) return
    try {
      const response = await axios.post(`${API_BASE}/simulator/touch`, {
        session_id: makeySessionId,
        pin,
        action: 'release',
      })
      set({ makeyPins: response.data.state.pins })
    } catch (error) {
      console.error('❌ Error soltando el pin:', error)
    }
  },

  initNezhaSession: async () => {
    if (get().nezhaSessionId) return
    try {
      const response = await axios.post(`${API_BASE}/simulator/session/create`, {
        platform: 'nezha',
      })
      set({ nezhaSessionId: response.data.session_id, nezhaState: initialNezhaState })
    } catch (error) {
      console.error('❌ Error creando sesión de Nezha:', error)
    }
  },

  setMotor: async (motor: string, speed: number) => {
    const { nezhaSessionId } = get()
    if (!nezhaSessionId) return
    /* Estos endpoints reciben los datos por query, no en el cuerpo. */
    try {
      const response = await axios.post(`${API_BASE}/simulator/nezha/motor`, null, {
        params: { session_id: nezhaSessionId, motor: Number(motor.replace('m', '')), speed },
      })
      set({ nezhaState: adaptarNezha(response.data.state) })
    } catch (error) {
      console.error('❌ Error moviendo el motor:', error)
    }
  },

  setServo: async (servo: string, angle: number) => {
    const { nezhaSessionId } = get()
    if (!nezhaSessionId) return
    try {
      const response = await axios.post(`${API_BASE}/simulator/nezha/servo`, null, {
        params: { session_id: nezhaSessionId, servo: Number(servo.replace('s', '')), angle },
      })
      set({ nezhaState: adaptarNezha(response.data.state) })
    } catch (error) {
      console.error('❌ Error moviendo el servo:', error)
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
