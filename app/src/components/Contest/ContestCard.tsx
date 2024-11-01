
import { Tables } from "../../database.types.ts";
import "../../assets/contest.scss";
import { Link } from "@tanstack/react-router";
export const ContestCard = ({ contest }: { contest: Tables<'art_contest'> }) => {
    const { status } = contest;
    return(
        <>
        <div className="contest-card col-12 col-sm-12 col-lg-5">
            <h3>{contest.title}</h3>
            <p className="description">{contest.description}</p>
            <div className="date-wrap d-flex">
                <p className="date-start col-6 fw-bold">Start: {contest.start_date ? new Date(contest.start_date).toLocaleDateString() : "missing"}</p>
                <p className="date-end col-6 fw-bold">Ends: {contest.end_date ? new Date(contest.end_date).toLocaleDateString() : "missing"}</p>
            </div>
            <Link to={`/contest/${contest.id}`} className="btn-cta primary text-center">
            {
                status === "finished" ? "View Results" :
                status === "open" ? "Vote" :
                status === "not_started" ? "View Entries" :
                "View Contest"
            }
            </Link>
        </div>
        </>
    )
}