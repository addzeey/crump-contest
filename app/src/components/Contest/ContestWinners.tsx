import { Tables } from "../../database.types";
import { EntryCard } from "./EntryCard";
import {useGetEntriesById} from "../../utils/supabase";
type Winner = {
    place: number;
    uuid: string;
};
type Entries = Tables<'art_contest'>;
type Winners = Winner[];
export const ContestWinners = ({winners}: { winners: Winners}) => {
    const {data: entries, isLoading, error} = useGetEntriesById(winners.map(winner => winner.uuid));
        // Create a mapping of uuid to place
        const winnerMap = winners.reduce((acc, winner) => {
            acc[winner.uuid] = winner.place;
            return acc;
        }, {} as Record<string, number>);
    
        // Sort entries based on the place value from the mapping
        const sortedEntries = entries?.sort((a, b) => {
            return (winnerMap[a.id] || 0) - (winnerMap[b.id] || 0);
        });
    return (
        <div className="results w-100 overflow-hidden">
            {JSON.stringify(winners)}
            <h2 className="text-white">Results</h2>
            <p className="text-white fs-5">The results are in! Check out the winners below:</p>
            <div className="results-wrap d-flex gap-2 py-3">
                {
                    sortedEntries != null && sortedEntries.length > 0 ? (
                        sortedEntries.map((winner, index) => (
                            <div className="winner-item">
                            <EntryCard key={index} entry={winner} />
                            </div>
                        ))
                    ) : null
                }
            </div>
        </div>
    )
}