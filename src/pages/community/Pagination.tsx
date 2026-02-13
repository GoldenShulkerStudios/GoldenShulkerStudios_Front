import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ current, total, onPageChange }: { current: number, total: number, onPageChange: (p: number) => void }) => {
    if (total <= 1) return null;
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '10px', marginBottom: '30px' }}>
            <button
                onClick={() => onPageChange(current - 1)}
                disabled={current === 1}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '5px', borderRadius: '50%', cursor: current === 1 ? 'default' : 'pointer', opacity: current === 1 ? 0.2 : 1 }}
            >
                <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary-yellow)' }}>{current} / {total}</span>
            <button
                onClick={() => onPageChange(current + 1)}
                disabled={current === total}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '5px', borderRadius: '50%', cursor: current === total ? 'default' : 'pointer', opacity: current === total ? 0.2 : 1 }}
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default Pagination;
