import { Plus, X } from 'lucide-react';
import { useState } from 'react';
export default function SkillManager({ skills = [], onChange }) {
    const [value, setValue] = useState('');
    const add = () => {
        const v = value.trim();
        if (!v || skills.some(s => s.toLowerCase() === v.toLowerCase()))
            return;
        onChange([...skills, v]);
        setValue('');
    };
    return (<>
        <div className="inline-add">
            <input
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                placeholder="e.g. SQL, React, Power BI"
                maxLength={40}
            />
            <button type="button" className="btn btn-outline" onClick={add}><Plus size={16}/> Add</button>
        </div>
        <div className="chips large-chips">
            {skills.map(s => (<button
                type="button"
                className="chip removable"
                key={s}
                onClick={() => onChange(skills.filter(x => x !== s))}
            >
                {s}
                <X size={13}/>
            </button>))}
        </div>
    </>);
}
