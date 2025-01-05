import { Tables } from "../../database.types";
import { EntryCard } from "./EntryCard";
import {useGetEntriesById} from "../../utils/supabase";
import { newWinners } from "../../data/newWinners";
type Winner = {
    uuid: string;
    vote_count: number;
};
type Contest = Tables<'art_contest'>;
type Winners = Winner[];
export const ContestWinners = ({contest, nsfwEnabled}: { contest: Contest, nsfwEnabled: boolean}) => {
    const winners: Winners = contest.winners as Winners;
    const {data: entries, isLoading, error} = useGetEntriesById(winners.map(winner => winner.uuid));
        // Create a mapping of uuid to place
        const winnerMap = winners.reduce((acc, winner) => {
            acc[winner.uuid] = winner.vote_count;
            return acc;
        }, {} as Record<string, number>);
        // Sort entries based on the place value from the mapping
        const sortedEntries = entries?.sort((a, b) => {
            return winnerMap[b.id] - winnerMap[a.id];
        }).slice(0, 5);
    return (
        <div className="results w-100 overflow-hidden">
            <h2 className="text-white">Results - <span>{contest.total_voted} people voted</span></h2>
            <p className="text-white fs-5">The results are in! Check out the winners below:</p>
            <div className="results-wrap d-flex gap-2 py-3">
                {
                    sortedEntries != null && sortedEntries.length > 0 ? (
                        sortedEntries.map((winner, index) => (
                            <div key={index} className="winner-item">
                            <EntryCard key={index} entry={winner} placement={index + 1} nsfwEnabled={nsfwEnabled} />
                            </div>
                        ))
                    ) : null
                }
            </div>
        </div>
    )
}