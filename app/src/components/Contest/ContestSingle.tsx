import { useParams } from '@tanstack/react-router'
import { getUserVotes, saveVote, useGetContests, useGetEntriesById, useGetUserVotes } from '../../utils/supabase';
import "../../assets/contest.scss";
import { ContestEntries } from './ContestEntries';
import { useCallback, useEffect, useState } from 'react';
import { ContestWinners } from './ContestWinners';
import { supabase } from '../../utils/supabase';
import { ContestVotes } from './ContestVotes';
import { VoteCard } from './VoteCard';
import { Tables } from '../../database.types';
type Winner = {
    place: number;
    uuid: string;
};
type Entry = Tables<'entries'>
export const ContestSingle = () => {
    const { contest } = useParams({
        from: '/contest/$contestId',
        select: (params) => ({
            contest: params.contestId,
        }),
    });
    const { data: contestData, isLoading, error } = useGetContests(contest);
    const { data: userVotes, isLoading: loadingVotes, error: errorVotes } = useGetUserVotes(contest);
    const [contestStatus, setContestStatus] = useState<string | null>(null);
    const [votingEnabled, setVotingEnabled] = useState(false);
    const [selectedVotes, setSelectedVotes] = useState<Entry[]>([]);
    const [initialVotesLoaded, setInitialVotesLoaded] = useState(false);
    function debounce(func: Function, delay: number) {
        let timeoutId: NodeJS.Timeout;
        return function(...args: any[]) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    }

    useEffect(() => {
        if (userVotes && userVotes.length > 0) {
            // get entries by id for each userVotes
            const existingVotes = userVotes.map((vote) => vote.votes);
            // covert json into array of strings
            const voteEntries = useGetEntriesById(existingVotes);
            setSelectedVotes(userVotes);
            setInitialVotesLoaded(true);
        }
    }, [userVotes]);
    
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

    useEffect(() => {
        if (initialVotesLoaded && selectedVotes.length > 0) {
            console.log('Saving votes', selectedVotes);
            
            // const debouncedSaveVote = debounce((contest: string, selectedVotes: Entry[]) => {
            //     saveVote(contest, selectedVotes);
            // }, 1000);
            // debouncedSaveVote(contest, selectedVotes);
        }
    }, [selectedVotes, contest, initialVotesLoaded]);
    
    const handleVoteChange = (entry: Entry) => {
        setSelectedVotes((prevVotes) => {
            if (prevVotes.some(vote => vote.id === entry.id)) {
                return prevVotes.filter((vote) => vote.id !== entry.id);
            } else if (prevVotes.length < 5) {
                return [...prevVotes, entry];
            } else {
                alert('You can only vote for up to 5 entries.');
                return prevVotes;
            }
        });
    };

    const handleDeleteVote = (entryId: string) => {
        setSelectedVotes((prevVotes) => prevVotes.filter((vote) => vote.id !== entryId));
    };
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
            {votingEnabled ? (
                <section className="selected-votes text-white py-3">
                    <h2>Selected Votes</h2>
                    <div className="selected-votes-wrap d-flex gap-2 py-3">
                        {selectedVotes.map((vote) => (
                            <div key={vote.id} className="selected-vote-item d-flex flex-column gap-1">
                                <VoteCard entry={vote} />
                                <button className='rm-vote w-100' onClick={() => handleDeleteVote(vote.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null
        }
            {
                contestData != null && contestData.length > 0 ? (
                    <ContestEntries contest={contestData[0]} onVoteChange={handleVoteChange} selectedVotes={selectedVotes} votingEnabled={votingEnabled} />
                ) : null
            }
        </div>
    )
}