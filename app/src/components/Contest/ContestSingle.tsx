import { useParams } from '@tanstack/react-router'
import { useGetContests } from '../../utils/supabase';
import "../../assets/contest.scss";
import { ContestEntries } from './ContestEntries';
import { useEffect, useState } from 'react';
import { ContestWinners } from './ContestWinners';

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
    const { data, isLoading, error } = useGetContests(contest);

    return (
        <div className='container'>
            <section className="text-white py-3">
                {isLoading && <p>Loading...</p>}
                {error && <p>Error: {error.message}</p>}
                {data != null && data.length > 0 ? (
                    <div className="contest-info">
                        <span className='badge bg-light text-dark fs-5 text-capitalize'>Status: {data[0].status}</span>
                        <h2 className='contest-title fs-1 py-2'>{data[0].title}</h2>
                        <div className="date-wrap d-flex gap-4 fs-5">
                            <span className='start badge bg-light text-dark'>
                                Start Date: {data[0].start_date ? new Date(data[0].start_date).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className='end badge bg-light text-dark'>
                                End Date: {data[0].end_date ? new Date(data[0].end_date).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <p className='description py-4 fs-5'>
                            {data[0].description}
                        </p>
                    </div>
                ) : null
                }
            </section>
            {
                data && data[0].status === 'finished' && data[0].winners != null ? (
                    <ContestWinners winners={data[0].winners} />
                ) : null
            }
            {
                data != null && data.length > 0 ? (
                    <ContestEntries contest={data[0]} />
                ) : null
            }
        </div>
    )
}