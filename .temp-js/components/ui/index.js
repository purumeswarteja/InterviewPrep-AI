import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
export function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
    const variants = {
        primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-md',
        secondary: 'bg-ink-900 text-white hover:bg-ink-800 shadow-sm',
        ghost: 'text-ink-700 hover:bg-ink-100',
        outline: 'border border-ink-300 text-ink-700 hover:bg-ink-50',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    const sizes = {
        sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
        md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
        lg: 'px-6 py-3 text-base rounded-xl gap-2',
    };
    return (_jsx("button", { className: cn('inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]', variants[variant], sizes[size], className), ...props, children: children }));
}
export function Card({ children, className, hover = false, }) {
    return (_jsx("div", { className: cn('card-surface p-5', hover && 'hover:shadow-lift hover:border-ink-300 transition-all duration-300 cursor-pointer', className), children: children }));
}
export function Badge({ children, color = 'gray', className, }) {
    const colors = {
        gray: 'bg-ink-100 text-ink-700',
        brand: 'bg-brand-100 text-brand-700',
        accent: 'bg-accent-100 text-accent-700',
        sky: 'bg-sky-100 text-sky-700',
        red: 'bg-red-100 text-red-700',
    };
    return (_jsx("span", { className: cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colors[color], className), children: children }));
}
export function ProgressBar({ value, max = 100, color = 'brand', className, }) {
    const colors = {
        brand: 'bg-brand-500',
        accent: 'bg-accent-500',
        sky: 'bg-sky-500',
        red: 'bg-red-500',
    };
    const pct = Math.min(100, (value / max) * 100);
    return (_jsx("div", { className: cn('h-2 rounded-full bg-ink-100 overflow-hidden', className), children: _jsx("div", { className: cn('h-full rounded-full transition-all duration-700', colors[color]), style: { width: `${pct}%` } }) }));
}
export function EmptyState({ icon: Icon, title, description, action, }) {
    return (_jsxs("div", { className: "flex flex-col items-center justify-center text-center py-16 px-4", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-ink-100 flex items-center justify-center mb-4", children: _jsx(Icon, { className: "w-8 h-8 text-ink-400" }) }), _jsx("h3", { className: "font-display font-semibold text-lg text-ink-900", children: title }), _jsx("p", { className: "text-ink-500 text-sm mt-1 max-w-sm", children: description }), action && _jsx("div", { className: "mt-6", children: action })] }));
}
export function ScoreRing({ score, size = 120 }) {
    const radius = size / 2 - 8;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (score / 100) * circ;
    const color = score >= 80 ? '#16b079' : score >= 60 ? '#ff7d11' : '#ef4444';
    return (_jsxs("div", { className: "relative", style: { width: size, height: size }, children: [_jsxs("svg", { className: "transform -rotate-90", width: size, height: size, children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: radius, stroke: "#eceef2", strokeWidth: "8", fill: "none" }), _jsx("circle", { cx: size / 2, cy: size / 2, r: radius, stroke: color, strokeWidth: "8", fill: "none", strokeDasharray: circ, strokeDashoffset: offset, strokeLinecap: "round", className: "transition-all duration-1000" })] }), _jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [_jsx("span", { className: "font-display font-bold text-2xl", style: { color }, children: Math.round(score) }), _jsx("span", { className: "text-xs text-ink-500", children: "score" })] })] }));
}
