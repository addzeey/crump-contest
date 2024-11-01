import { Tables } from "../../database.types";
import { EntryCard } from "./EntryCard";
import {useGetEntriesById} from "../../utils/supabase";
type Vote = {
    uuid: string;
};
type Votes = Vote[];
export const ContestVotes = ({votes}: { votes: Votes}) => {
    const {data: selectedVotes, isLoading, error} = useGetEntriesById(votes.map(vote => vote.uuid));
    return (
        <div className="results w-100 overflow-hidden">
            <h2 className="text-white">Results</h2>
            <p className="text-white fs-5">The results are in! Check out the winners below:</p>
            <div className="results-wrap d-flex gap-2 py-3">
                {
                    selectedVotes != null && selectedVotes.length > 0 ? (
                        selectedVotes.map((winner, index) => (
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