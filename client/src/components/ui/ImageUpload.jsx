// src/components/ui/ImageUpload.jsx
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

export function ImageUpload({
    endpoint,          // API endpoint e.g. '/api/upload/cafe/cover'
    currentImage,      // existing image URL
    onSuccess,         // callback(newUrl)
    label = 'Upload Image',
    aspect = '16/9',  // CSS aspect ratio
    circular = false
}) {
    const [preview, setPreview] = useState(currentImage || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ─── Validate ────────────────────────────
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be under 5MB');
            return;
        }

        setError('');
        setUploading(true);

        // ─── Show local preview immediately ──────
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await api.post(endpoint, formData);

            // ─── Update with Cloudinary URL ────────
            const cloudUrl = res.data.coverImage || res.data.logo || res.data.image;
            setPreview(cloudUrl);
            onSuccess?.(cloudUrl);

        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
            setPreview(currentImage || null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`
          relative border-3 border-dashed border-ink overflow-hidden cursor-pointer
          bg-yellow/20 hover:bg-yellow/40 transition-colors group
          ${circular ? 'rounded-full' : 'rounded-2xl'}
        `}
                style={{ aspectRatio: circular ? '1/1' : aspect }}
                onClick={() => inputRef.current?.click()}
            >
                {/* Preview / Placeholder */}
                {preview ? (
                    <img
                        src={preview}
                        alt="Preview"
                        className={`w-full h-full object-cover ${circular ? 'rounded-full' : ''}`}
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <span className="text-4xl">📸</span>
                        <span className="font-bangers text-xl text-ink/60">{label}</span>
                        <span className="font-mono text-xs text-ink/40">JPG, PNG, WEBP — Max 5MB</span>
                    </div>
                )}

                {/* Upload overlay */}
                <div className={`
          absolute inset-0 bg-ink/60 flex flex-col items-center justify-center gap-2
          opacity-0 group-hover:opacity-100 transition-opacity
          ${circular ? 'rounded-full' : ''}
        `}>
                    <span className="text-3xl">✏️</span>
                    <span className="font-bangers text-cream text-lg">Change Image</span>
                </div>

                {/* Loading overlay */}
                {uploading && (
                    <div className={`absolute inset-0 bg-ink/80 flex items-center justify-center ${circular ? 'rounded-full' : ''}`}>
                        <div className="text-center">
                            <div className="text-3xl animate-spin mb-2">⏳</div>
                            <span className="font-bangers text-cream text-sm">Uploading...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Error */}
            {error && (
                <p className="font-grotesk text-sm text-red mt-2">{error}</p>
            )}

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Upload hint */}
            {!uploading && (
                <p className="font-mono text-xs text-ink/50 text-center mt-2">
                    Click to {preview ? 'change' : 'upload'} image
                </p>
            )}
        </div>
    );
}