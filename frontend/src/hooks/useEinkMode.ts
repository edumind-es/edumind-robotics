/*
 * Hook para gestionar el modo e-ink — persistido en localStorage
 */

import { useState, useEffect } from 'react'

export const useEinkMode = () => {
  const [eink, setEink] = useState<boolean>(() => {
    return localStorage.getItem('edumind-eink') === 'true'
  })

  useEffect(() => {
    const html = document.documentElement
    if (eink) {
      html.classList.add('eink')
    } else {
      html.classList.remove('eink')
    }
    localStorage.setItem('edumind-eink', String(eink))
  }, [eink])

  return { eink, setEink }
}
