import { NewEntry } from '@/components/Admin/NewEntry'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/admin/')({
  component: () => {
    return (
      <div className='container admin'>
        <h1 className='contest-title fs-1 py-2'>Admin Area</h1>
        <div className="col-12 d-flex flex-column flex-sm-row gap-3 col-12 align-items-center justify-content-center">
          <NewEntry />
        </div>
      </div>
    )
  }
})
