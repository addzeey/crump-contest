import { createFileRoute } from '@tanstack/react-router'
import { TwitchButton } from '../components/Auth/TwitchButton'
import "../assets/login.scss"
export const Route = createFileRoute('/login')({
  component: () => {
    return (
      <div className='container'>
        <h1 className='contest-title fs-1 py-2'>Login</h1>
        <TwitchButton />
      </div>
    )
  }
})