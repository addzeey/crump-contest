import { createFileRoute } from '@tanstack/react-router'
import { getContestSingle } from '../utils/supabase'
import { ContestSingle } from '../components/Contest/ContestSingle'

export const Route = createFileRoute('/contest/$contestId')({
  loader: ({ context: { queryClient }, params: { contestId } }) => {
    return queryClient.ensureQueryData(getContestSingle(contestId))
  },
  component: ContestSingle,
})