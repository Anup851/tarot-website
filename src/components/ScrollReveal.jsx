import { useEffect, useRef, useState } from 'react'

export default function ScrollReveal({
  as: Component = 'div',
  children,
  className = '',
  delay = 0,
  once = true,
  style,
  ...props
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.unobserve(entry.target)
        } else if (!once) {
          setVisible(false)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.16 },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [once])

  return (
    <Component
      ref={ref}
      className={`scroll-reveal-3d ${visible ? 'is-visible' : ''} ${className}`}
      style={{ ...style, '--reveal-delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </Component>
  )
}
