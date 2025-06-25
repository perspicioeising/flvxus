// app/(auth)/callback/page.tsx
import React, { Suspense } from 'react'
import AuthCallbackPage from './AuthCallbackPage'

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
      <AuthCallbackPage />
    </Suspense>
  )
}
