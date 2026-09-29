import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Clapperboard } from 'lucide-react'
import { useApp } from '../state/AppContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Field, FieldGroup, FieldLabel } from '../components/ui/field'
import { Alert, AlertDescription } from '../components/ui/alert'

export function LoginPage() {
  const { login } = useApp()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    setError(!login(username, password))
  }

  function fillDemoAccount() {
    setUsername('demo')
    setPassword('movie123')
    setError(false)
  }

  return <div className="login-page">
    <aside className="login-visual" aria-label="Cinema auditorium">
      <div className="login-visual-content">
        <div className="login-brand" aria-label="Frame by Frame">frame<span>/</span>frame.</div>
        <div className="login-story">
          <span className="login-kicker"><Clapperboard aria-hidden="true" /> A home for film lovers</span>
          <h1>Find your<br /><em>next favorite.</em></h1>
          <p>Explore what is playing in the world of film. Keep the ones that stay with you.</p>
        </div>
        <div className="login-visual-footer"><span>Discover. Watch. Remember.</span><span>01 / 01</span></div>
      </div>
    </aside>

    <main className="login-form-panel">
      <div className="login-form-wrap">
        <p className="login-form-eyebrow">Your film shelf awaits</p>
        <h2>Welcome back<span className="login-heading-dot">.</span></h2>
        <p className="login-form-intro">Sign in to find tonight’s film.</p>

        <form onSubmit={submit} className="login-form">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input id="username" autoComplete="username" value={username} onChange={(event) => { setUsername(event.target.value); setError(false) }} required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); setError(false) }} required />
            </Field>
            {error && <Alert variant="destructive"><AlertDescription>Those demo credentials did not match. Try the account below.</AlertDescription></Alert>}
          </FieldGroup>
          <Button type="submit" size="lg" className="mt-7 w-full">Enter the cinema <ArrowRight data-icon="inline-end" /></Button>
        </form>

        <div className="login-demo">
          <div><span className="login-demo-label">Just looking around?</span><p>Use the demo account to explore every feature.</p></div>
          <Button type="button" variant="outline" size="sm" onClick={fillDemoAccount}>Fill demo details</Button>
        </div>
        <p className="login-credentials">Demo login <strong>demo</strong><span aria-hidden="true">/</span><strong>movie123</strong></p>
      </div>
      <p className="login-panel-footer">Made for the films you love.</p>
    </main>
  </div>
}
