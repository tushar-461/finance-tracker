import { memo, useMemo, useState } from "react";
import { formatCurrency, toTitleCase } from "../utils/format";

const ROW_HEIGHT = 52;
const VIEWPORT_HEIGHT = 360;
const OVERSCAN = 4;

const TransactionRow = memo(function TransactionRow({ item, onEdit, onDelete, canMutate }) {
  return (
    <div className="vrow">
      <span>{item.date}</span>
      <span>{toTitleCase(item.type)}</span>
      <span>{toTitleCase(item.category)}</span>
      <span>{formatCurrency(item.amount)}</span>
      <span>{item.note}</span>
      <span className="row-actions">
        <button onClick={() => onEdit(item)} disabled={!canMutate}>
          Edit
        </button>
        <button onClick={() => onDelete(item.id)} disabled={!canMutate}>
          Delete
        </button>
      </span>
    </div>
  );
});

export default function VirtualTransactionList({ data, onEdit, onDelete, canMutate }) {
  const [scrollTop, setScrollTop] = useState(0);

  const { startIndex, endIndex, offsetY, totalHeight, items } = useMemo(() => {
    const total = data.length;
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + OVERSCAN * 2;
    const end = Math.min(total, start + visibleCount);

    return {
      startIndex: start,
      endIndex: end,
      offsetY: start * ROW_HEIGHT,
      totalHeight: total * ROW_HEIGHT,
      items: data.slice(start, end),
    };
  }, [data, scrollTop]);

  return (
    <div className="virtual-wrap" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
      <div className="vheader">
        <span>Date</span>
        <span>Type</span>
        <span>Category</span>
        <span>Amount</span>
        <span>Note</span>
        <span>Action</span>
      </div>
      <div className="vviewport" style={{ height: VIEWPORT_HEIGHT }}>
        <div style={{ height: totalHeight, position: "relative" }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {items.map((item) => (
              <TransactionRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} canMutate={canMutate} />
            ))}
          </div>
        </div>
      </div>
      <p className="muted tiny">
        Virtualized rows: showing {startIndex + 1}-{Math.max(startIndex, endIndex)} of {data.length}
      </p>
    </div>
  );
}