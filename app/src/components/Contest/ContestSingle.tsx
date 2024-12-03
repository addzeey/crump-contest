import { Link, useParams } from '@tanstack/react-router'
import { getEntryById, getUserVotes, saveVote, useGetContestEntries, useGetContests, useGetEntriesById, useGetRoles, useGetUserVotes, useUserQuery } from '../../utils/supabase';
import "../../assets/contest.scss";
import { ContestEntries } from './ContestEntries';
import { useCallback, useEffect, useState } from 'react';
import { ContestWinners } from './ContestWinners';
import { supabase, updateContestStatus } from '../../utils/supabase';
import { ContestVotes } from './ContestVotes';
import { VoteCard } from './VoteCard';
import { Tables } from '../../database.types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckToSlot, faLock } from '@fortawesome/free-solid-svg-icons';
type Winner = {
    place: number;
    uuid: string;
};
type Alert = {
    message: string;
    type: string;
}
type Entry = Tables<'entries'>
export const ContestSingle = () => {
    const { contest } = useParams({
        from: '/contest/$contestId',
        select: (params) => ({
            contest: params.contestId,
        }),
    });
    const { data: contestData, isLoading, error, refetch: refetchContest } = useGetContests(contest);
    const { data: user, error: userError, isLoading: userLoading } = useUserQuery();
    const { data: userVotes, isLoading: loadingVotes, error: errorVotes } = useGetUserVotes(contest);
    const { data: entries, isLoading: loadingEntries, error: entriesError } = useGetContestEntries(contest);
    const { data: userRoles, isLoading: rolesLoading, error: rolesError } = useGetRoles();
    const [contestStatus, setContestStatus] = useState<string | null>(null);
    const [votingEnabled, setVotingEnabled] = useState(false);
    const [selectedVotes, setSelectedVotes] = useState<Entry[]>([]);
    const  [alert, setAlert] = useState<Alert | null>(null);
    const max_votes = contestData != null ? contestData[0].max_votes : 5;
    useEffect(() => {
        if (userVotes && !errorVotes) {
            const existingVotes = userVotes.votes;
        if(existingVotes != null && existingVotes.length > 0 && entries != null) {
            console.log('Existing votes', existingVotes);
            const voteEntries = entries.filter((entry) => existingVotes.includes(entry.id));
            setSelectedVotes(voteEntries);
        }
    }
    }, [errorVotes, userVotes, entries]);
    
    useEffect(() => {
        // Set up a real-time subscription to the 'contest' table
        const artContest = supabase.channel('contest_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'art_contest' }, payload => {
                console.log('Change received!', payload)
                if(payload.new.status) {
                    setContestStatus(payload.new.status);
                    refetchContest();
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
            } else {
                setVotingEnabled(false);
            }
        }
    }, [contestData]);
    
    const handleVoteChange = (entry: Entry) => {
        setSelectedVotes((prevVotes) => {
            if(entry.canVote != true) {
                setAlert({message: 'You can only vote for entries that are marked as voteable', type: 'info'});
                return prevVotes;
            }
            if (prevVotes.some(vote => vote.id === entry.id)) {
                return prevVotes.filter((vote) => vote.id !== entry.id);
            } else if (prevVotes.length < max_votes) {
                return [...prevVotes, entry];
            } else {
                setAlert({message: `You can only vote for up to ${max_votes} entries.`, type: 'info'});
                return prevVotes;
            }
        });
    };

    const handleDeleteVote = (entryId: string) => {
        setSelectedVotes((prevVotes) => prevVotes.filter((vote) => vote.id !== entryId));
    };
    const handleVoteSubmit = () => {
        if( selectedVotes.length == max_votes) {
            saveVote(contest,selectedVotes);
            setAlert({message: 'Vote submitted successfully', type: 'success'});
        } else {
            const message = (selectedVotes.length > max_votes) ? `You can only vote for up to ${max_votes} entries.` : `You must select ${max_votes} entries to vote.`;
            setAlert({message: message, type: 'danger'});
        }
    }

    const handleStatusChange = (status: string) => {
        updateContestStatus(contest, status);
    }
    return (
        <div className='container'>
            {
                user != null && userRoles && (userRoles.isAdmin || userRoles.isMod) ? (
                    <section id="admin-sect" className="text-white d-flex gap-2 align-items-center">
                    <h4 className='text-white'>Admin:</h4>
                    {
                        contestStatus === 'open' ? (
                            <button onClick={() => handleStatusChange("voting")} className='btn btn-danger'>Open Voting</button>
                        ) : null
                    }
                    {
                        contestStatus === 'voting' ? (
                            <button onClick={() => handleStatusChange("closed")} className='btn btn-warning'>Close and count votes</button>
                        ) : null
                    }
                    {
                        contestStatus === 'closed' ? (
                            <button onClick={() => handleStatusChange("finished")} className='btn btn-danger'>Finish and reveal winners</button>
                        ) : null
                    }
                </section>
                ) : null
            }
            <section className="text-white py-3">
                {isLoading && <p>Loading...</p>}
                {error && <p>Error: {error.message}</p>}
                {contestData != null && contestData.length > 0 ? (
                    <div className="contest-info">
                        <span className='badge bg-light text-dark fs-5 text-capitalize'>Status: {contestStatus}</span>
                        <h2 className='contest-title fs-1 py-2'>{contestData[0].title}</h2>
                        <div className="date-wrap d-flex flex-column flex-sm-row gap-4 fs-5">
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
                    <ContestWinners contest={contestData[0]} />
                ) : null
            }
            {contestData != null && contestStatus === 'voting' && user != null? (
                <section className="selected-votes text-white py-3">
                    <div className="voting-header d-flex flex-column flex-sm-row gap-2 ">
                    <h2>Selected Votes - <span>{selectedVotes.length} / {contestData[0].max_votes}</span></h2>
                    <button onClick={handleVoteSubmit} 
                        className={`submit-btn ${selectedVotes.length == max_votes ? "active" : ""} d-inline-flex align-items-center gap-2`}>
                            <FontAwesomeIcon icon={faCheckToSlot} />
                            Submit Vote
                    </button>
                    </div>
                    {
                        alert ? (
                            <p className={`mt-2 alert alert-${alert.type}`}>
                                {alert.message}
                            </p>
                        ) : null
                    }
                    <div className="selected-votes-wrap d-flex flex- flex-wrap row gap-2 py-3">
                        {selectedVotes.map((vote) => (
                            <div key={vote.id} className="selected-vote-item d-flex flex-column gap-1 col-12 col-sm-2">
                                <VoteCard entry={vote} />
                                <button className='rm-vote w-100' onClick={() => handleDeleteVote(vote.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                votingEnabled && !user ? (
                    <p className='alert alert-info fw-bold'>Please <Link to={"/account"}>login</Link> to vote.</p>
                ) : null
            )
        }
            {
                contestData != null && contestData.length > 0 && entries? (
                    <ContestEntries contest={contestData[0]} entries={entries ?? []} onVoteChange={handleVoteChange} selectedVotes={selectedVotes} votingEnabled={votingEnabled && user != null} />
                ) : null
            }
        </div>
    )
}