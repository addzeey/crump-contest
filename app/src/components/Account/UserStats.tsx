import { useUserQuery } from "../../utils/supabase";

export const UserStats = () => {
    const { data: user, error, isLoading: loading } = useUserQuery();
    return (
        <div className="nerdy-stats col-6">
            <div className="contest-card">
                <div className="card-body">
                    <h3 className="card-title">Nerdy Stats</h3>
                    <ul className="d-flex flex-column gap-2">
                        <li className="mt-2">Nerdy Stats coming soon!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}