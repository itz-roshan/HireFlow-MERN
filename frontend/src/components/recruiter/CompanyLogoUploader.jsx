import { useState } from 'react';
import Avatar from '../ui/Avatar';
import { Camera } from 'lucide-react';
import { api } from '../../api/client';
import Toast from '../common/Toast';
export default function CompanyLogoUploader({ company, onChange }) {
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState('');
    const upload = async (file) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
            return setToast('Use JPG, PNG or WEBP.');
        if (file.size > 3 * 1024 * 1024)
            return setToast('Company logo must be 3 MB or smaller.');
        setBusy(true);
        try {
            const formData = new FormData();
            formData.append('logo', file);
            const response = await api.post('/companies/mine/logo', formData);
            onChange?.(response.data.data.company);
            setToast('Company logo updated.');
        }
        catch (e) {
            setToast(e.response?.data?.message || 'Logo upload failed');
        }
        finally {
            setBusy(false);
        }
    };
    return (<div className="company-logo-uploader">
        <Avatar src={company?.logo} name={company?.name || 'Company'} size="xl"/>
        <div>
            <label className={`btn btn-outline ${busy ? 'disabled' : ''}`}>
                <Camera size={15}/>
                {busy ? 'Uploading…' : 'Change logo'}
                <input
                    hidden
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={busy}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                upload(file);
                        e.target.value = '';
                    }}
                />
            </label>
            <span>PNG/JPG/WEBP · max 3 MB</span>
        </div>
        <Toast message={toast} onClose={() => setToast('')}/>
    </div>);
}
