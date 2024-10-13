import { useGetLatestContest } from '../../utils/supabase';
import "../../assets/obs.scss";
import { ObsGallery } from './ObsGallery';

export const ObsScene = () => {
    const { data, isLoading, error } = useGetLatestContest();

    return (
        <div className='obs-parent'>
            {
                data != null && data.length > 0 ? (
                    <ObsGallery contest={data[0]} />
                ) : null
            }
        </div>
    )
}