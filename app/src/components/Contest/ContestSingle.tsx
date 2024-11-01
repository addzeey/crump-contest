import { useParams } from '@tanstack/react-router'
import { useGetContests } from '../../utils/supabase';
import "../../assets/contest.scss";
import { ContestEntries } from './ContestEntries';
import { useEffect, useState } from 'react';
import { ContestWinners } from './ContestWinners';
import { supabase } from '../../utils/supabase';
type Winner = {
    place: number;
    uuid: string;
};

type Winners = Winner[];
export const ContestSingle = () => {
    const { contest } = useParams({
        from: '/contest/$contestId',
        select: (params) => ({
            contest: params.contestId,
        }),
    });
    const { data: contestData, isLoading, error } = useGetContests(contest);
    const [contestStatus, setContestStatus] = useState<string | null>(null);
    const [votingEnabled, setVotingEnabled] = useState(false);

    useEffect(() => {
        // Set up a real-time subscription to the 'contest' table
        const artContest = supabase.channel('contest_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'art_contest' }, payload => {
                console.log('Change received!', payload)
                if(payload.new.status) {
                    setContestStatus(payload.new.status);
                }
                if(payload.new.status === 'voting') {
                    setVotingEnabled(true);
                }
            })
            .subscribe()


        // Clean up the subscriptions on component unmount
        return () => {
            supabase.removeChannel(artContest);
        };
    }, []);

    useEffect(() => {
        if (contestData != null && contestData.length > 0) {
            setContestStatus(contestData[0].status);
            if(contestData[0].status === 'voting') {
                setVotingEnabled(true);
            }
        }
    }, [contestData]);

    return (
        <div className='container'>
            <section className="text-white py-3">
                {isLoading && <p>Loading...</p>}
                {error && <p>Error: {error.message}</p>}
                {contestData != null && contestData.length > 0 ? (
                    <div className="contest-info">
                        <span className='badge bg-light text-dark fs-5 text-capitalize'>Status: {contestStatus}</span>
                        <h2 className='contest-title fs-1 py-2'>{contestData[0].title}</h2>
                        <div className="date-wrap d-flex gap-4 fs-5">
                            <span className='start badge bg-light text-dark'>
                                Start Date: {contestData[0].start_date ? new Date(contestData[0].start_date).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className='end badge bg-light text-dark'>
                                End Date: {contestData[0].end_date ? new Date(contestData[0].end_date).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <p className='description py-4 fs-5'>
                            {contestData[0].description}
                        </p>
                    </div>
                ) : null
                }
            </section>
            {
                contestData && contestData[0].status === 'finished' && contestData[0].winners != null ? (
                    <ContestWinners winners={contestData[0].winners} />
                ) : null
            }
            {
                contestData != null && contestData.length > 0 ? (
                    <ContestEntries contest={contestData[0]} />
                ) : null
            }
        </div>
    )
}