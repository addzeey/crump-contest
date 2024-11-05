import { createLazyFileRoute } from '@tanstack/react-router'
import { useGetContests } from '../utils/supabase'
import { ContestCard } from '../components/Contest/ContestCard.tsx';
import { isBefore } from 'date-fns';

export const Route = createLazyFileRoute('/')({
    component: Index,
})

function Index() {
    const { data: contests, isLoading, error } = useGetContests();

    const currentDate = new Date();

    const currentContests = contests?.filter(contest => contest.status != 'finished');
    const pastContests = contests?.filter(contest => contest.status == 'finished');

    return (
        <section className="container pt-3">
            <h2 className="sub-title text-uppercase py-3">
                Current Contests
            </h2>
            <div className="contest-wrap d-flex flex-column flex-sm-row gap-2 py-3">
                {
                    isLoading ? (
                        <p className="loading text-white fs-3">Loading Contests</p>
                    ) : 
                    error ? (
                        <p className="error text-danger">Error loading contests</p>
                    ) : (
                        currentContests?.map((contest) => (
                            <ContestCard key={contest.id} contest={contest} />
                        ))
                    )
                }
            </div>
            <h2 className="sub-title text-uppercase py-3 border-top">
                Past Contests
            </h2>
            <div className="contest-wrap gap-2 py-3">
                {
                    isLoading ? (
                        <p className="loading">Loading Contests</p>
                    ) : 
                    error ? (
                        <p className="error">Error loading contests</p>
                    ) : (
                        pastContests?.map((contest) => (
                            <ContestCard key={contest.id} contest={contest} />
                        ))
                    )
                }
            </div>
        </section>
    )
}