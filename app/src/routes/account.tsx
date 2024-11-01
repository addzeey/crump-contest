import { createFileRoute } from '@tanstack/react-router'
import { TwitchButton } from '../components/Auth/TwitchButton'
import "../assets/login.scss"
import { UserStats } from '../components/Account/UserStats'
export const Route = createFileRoute('/account')({
  component: () => {
    return (
      <div className='container'>
        <h1 className='contest-title fs-1 py-2'>Account</h1>
        <div className="col-12 d-flex gap-3">
        <TwitchButton />
        <UserStats />
        </div>
      </div>
    )
  }
})