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
export const ContestWinners = ({contest}: { contest: Contest}) => {
    const winners: Winners = contest.winners as Winners;
    const tempWinners = [{"uuid": "34adc9d5-fee1-48bc-b800-6cb4a520943a", "place": 1}, {"uuid": "fba4eeaf-28d3-497e-9d60-b1661f033335", "place": 2}, {"uuid": "2fc61ae5-b81c-4747-860f-1e6351cc3f51", "place": 3}, {"uuid": "986378bd-9115-466c-a7d0-bb5fc516e0db", "place": 4}, {"uuid": "c7bae69d-2ae9-4887-9977-803fe30f46f9", "place": 5}]
    const {data: entries, isLoading, error} = useGetEntriesById(tempWinners.map(winner => winner.uuid));
        // Create a mapping of uuid to place
        const winnerMap = winners.reduce((acc, winner) => {
            acc[winner.uuid] = winner.vote_count;
            return acc;
        }, {} as Record<string, number>);
        // Sort entries based on the place value from the mapping
        const sortedEntries = entries?.sort((a, b) => {
            return winnerMap[b.id] - winnerMap[a.id];
        });
    return (
        <div className="results w-100 overflow-hidden">
            <h2 className="text-white">Results - <span>{contest.total_voted} people voted</span></h2>
            <p className="text-white fs-5">The results are in! Check out the winners below:</p>
            <div className="results-wrap d-flex gap-2 py-3">
                {
                    sortedEntries != null && sortedEntries.length > 0 ? (
                        sortedEntries.map((winner, index) => (
                            <div key={index} className="winner-item">
                            <EntryCard key={index} entry={winner} placement={index + 1} />
                            </div>
                        ))
                    ) : null
                }
            </div>
        </div>
    )
}