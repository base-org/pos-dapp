'use client'

import { ReactNode, useEffect } from 'react'
import useTheme from '@/app/hooks/useTheme'

const ThemeProvider = ({ children } : { children: ReactNode }) => {
  const { theme } = useTheme()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <>{children}</>
}

export default ThemeProvider