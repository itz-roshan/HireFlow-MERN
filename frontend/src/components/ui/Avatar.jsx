import { useState } from 'react';
import { UserRound } from 'lucide-react';
import { mediaUrl } from '../../utils/media';
export default function Avatar({ src, name = 'User', size = 'md', className = '' }) {
    const [broken, setBroken] = useState(false);
    const validSrc = src && !broken ? mediaUrl(src) : '';
    return (<div className={`avatar avatar-${size} ${className}`} aria-label={`${name} profile photo`}>
        {validSrc ? <img src={validSrc} alt={name} onError={() => setBroken(true)}/> : <span className="avatar-fallback">
            <UserRound size={size === 'xl' ? 30 : size === 'lg' ? 24 : 17}/>
        </span>}
    </div>);
}
