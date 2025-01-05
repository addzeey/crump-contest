
import { Tables } from "../../database.types.ts";
import "../../assets/contest.scss";
import { Link } from "@tanstack/react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
export const ContestCard = ({ contest }: { contest: Tables<'art_contest'> }) => {
    const { status } = contest;
    return(
        <>
        <div className="contest-card col-12 col-sm-12 col-lg-5 position-relative">
                {
                    contest.nsfw ? (
                        <span className="fs-6 nsfw-badge badge bg-danger position-absolute top-0 start-50 translate-middle">
                            <FontAwesomeIcon icon={faCircle} />
                            <span className="p-1">NSFW</span>
                        </span>
                    ) : null
                }
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