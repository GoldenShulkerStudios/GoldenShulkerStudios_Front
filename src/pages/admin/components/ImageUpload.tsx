import { useState } from 'react';

const ImageUpload = ({ value, onChange, label }: { value: string, onChange: (url: string) => void, label: string }) => {
    const [uploading, setUploading] = useState(false);
    const token = localStorage.getItem('token');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8001/api/v1/utils/upload-media', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Error subiendo imagen');
            }
            const data = await response.json();
            onChange(`http://localhost:8001${data.url}`);
        } catch (err: any) {
            alert(err.message || 'Error al subir la imagen');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="admin-form-group">
            <label>{label}</label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {value && <img src={value} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />}
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }}
                    />
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px dashed rgba(255,255,255,0.2)',
                        padding: '10px',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '0.8rem'
                    }}>
                        {uploading ? 'Subiendo...' : value ? 'Cambiar Imagen' : 'Seleccionar Archivo'}
                    </div>
                </div>
                <input type="hidden" name={label.toLowerCase().includes('avatar') ? 'image_url' : (label.toLowerCase().includes('imagen') ? 'image_url' : '')} value={value} />
            </div>
        </div>
    );
};

export default ImageUpload;
