import { useState, useEffect } from 'react'

export function useWindowSize() {
  // Initialize with safe defaults that work for mobile
  const getInitialSize = () => {
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth || 768,
        height: window.innerHeight || 1024,
      }
    }
    return { width: 768, height: 1024 } // Default to mobile size
  }

  const [windowSize, setWindowSize] = useState(getInitialSize)

  useEffect(() => {
    // Set initial size immediately if window is available
    if (typeof window !== 'undefined') {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    function handleResize() {
      if (typeof window !== 'undefined') {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
    }

    // Use a small timeout to ensure window is ready on mobile devices
    const timeoutId = setTimeout(() => {
      if (typeof window !== 'undefined') {
        handleResize()
        window.addEventListener('resize', handleResize)
        // Also listen for orientation changes on mobile
        window.addEventListener('orientationchange', handleResize)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('orientationchange', handleResize)
      }
    }
  }, [])

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width <= 768,
    isSmallMobile: windowSize.width <= 480,
    isTablet: windowSize.width > 768 && windowSize.width <= 1024,
    isDesktop: windowSize.width > 1024
  }
}


