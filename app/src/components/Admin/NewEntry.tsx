import React, { useState } from 'react';
import { supabase } from '@utils/supabase';

export const NewEntry = () => {
    const [entryData, setEntryData] = useState({
        contest_id: '',
        discord_id: '',
        discord_name: '',
        message: '',
        image_count: 1,
        isVideo: '',
        canVote: true,
        isGif: false,
    });
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEntryData({
            ...entryData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleFileChange = (e) => {
        setImages(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        // Step 1: Add entry to the entries table
        const { data: entry, error: entryError } = await supabase
            .from('entries')
            .insert([entryData])
            .single();

        if (entryError) {
            console.error('Error adding entry:', entryError);
            setUploading(false);
            return;
        }

        const uuid = entry.id; // Assuming 'id' is the UUID of the new entry

        // Step 2: Upload images to the edge function
        const formData = new FormData();
        images.forEach((image, index) => {
            const fileName = images.length > 1 ? `${uuid}_${index + 1}.png` : `${uuid}.png`;
            formData.append('files', new File([image], fileName));
        });

        const response = await fetch('/api/upload-images', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            console.log('Images uploaded successfully');
        } else {
            console.error('Error uploading images');
        }

        setUploading(false);
    };

    return (
        <form id="new-entry-form" onSubmit={handleSubmit} className='contest-card d-flex flex-column col-10 gap-3 justify-content-center'>
            <h4 className='text-center'>Coming soon</h4>
            {/* <input
                type="text"
                name="contest_id"
                placeholder="Contest ID"
                value={entryData.contest_id}
                onChange={handleChange}
                required
            />
            <input
                type="number"
                name="discord_id"
                placeholder="Discord ID"
                value={entryData.discord_id}
                onChange={handleChange}
                required
            />
            <input
                type="text"
                name="discord_name"
                placeholder="Discord Name"
                value={entryData.discord_name}
                onChange={handleChange}
                required
            />
            <textarea
                name="message"
                placeholder="Message"
                value={entryData.message}
                onChange={handleChange}
                required
            />
            <input
                type="number"
                name="image_count"
                placeholder="Image Count"
                value={entryData.image_count}
                onChange={handleChange}
                min="1"
                required
            />
            <input
                type="text"
                name="isVideo"
                placeholder="Is Video (true/false)"
                value={entryData.isVideo}
                onChange={handleChange}
            />
            <label>
                Can Vote:
                <input
                    type="checkbox"
                    name="canVote"
                    checked={entryData.canVote}
                    onChange={handleChange}
                />
            </label>
            <label>
                Is GIF:
                <input
                    type="checkbox"
                    name="isGif"
                    checked={entryData.isGif}
                    onChange={handleChange}
                />
            </label>
            <input type="file" multiple onChange={handleFileChange} required />
            <button type="submit" disabled={uploading} className="btn-cta primary">
                {uploading ? 'Uploading...' : 'Add Entry'}
            </button> */}
        </form>
    );
};