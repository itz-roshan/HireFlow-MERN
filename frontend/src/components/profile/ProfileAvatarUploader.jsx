import { Camera, Trash2 } from 'lucide-react';
import Avatar from '../ui/Avatar';
export default function ProfileAvatarUploader({ user, onUpload, onRemove, busy }) {
    return (<div className="profile-avatar-box">
        <Avatar src={user?.avatar} name={user?.name} size="xl"/>
        <div className="avatar-actions">
            <label className={`avatar-upload ${busy ? 'disabled' : ''}`} title="Change profile photo">
                <Camera size={16}/>
                <span>
                    {busy ? 'Uploading…' : 'Change photo'}
                </span>
                <input
                    hidden
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={busy}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file)
                onUpload(file);
                        e.target.value = '';
                    }}
                />
            </label>
            {user?.avatar && <button type="button" className="btn btn-ghost btn-sm" onClick={onRemove} disabled={busy}><Trash2 size={14}/> Remove</button>}
        </div>
        <p>PNG, JPG or WEBP · max 3 MB</p>
    </div>);
}
