import { useSortable } from "@dnd-kit/react/sortable";
import { FiArrowDown, FiArrowUp, FiMenu } from "react-icons/fi";

type RankedOptionProps = {
  index: number;
  onMove: ({ source, target }: { source: string; target: string }) => void;
  option: string;
  options: string[];
};

export const RankedOption = ({ index, onMove, option, options }: RankedOptionProps) => {
  const { handleRef, isDragging, ref } = useSortable({
    group: "ranked-options",
    id: option,
    index,
    transition: { duration: 220, easing: "cubic-bezier(0.25, 1, 0.5, 1)", idle: true },
  });
  return (
    <div className={`flex items-center gap-3 rounded-app border p-3 ${isDragging ? "border-app-primary bg-app-info opacity-60" : "border-app-border"}`} ref={ref}>
      <button aria-label={`Reorder ${option}`} className="cursor-grab text-app-text-muted active:cursor-grabbing" ref={handleRef} type="button">
        <FiMenu />
      </button>
      <span className="flex size-7 items-center justify-center rounded-app bg-app-info font-bold text-app-primary">{index + 1}</span>
      <span className="grow">{option}</span>
      <button aria-label={`Move ${option} up`} disabled={index === 0} onClick={() => index > 0 && onMove({ source: option, target: options[index - 1] })} type="button">
        <FiArrowUp />
      </button>
      <button
        aria-label={`Move ${option} down`}
        disabled={index === options.length - 1}
        onClick={() => index < options.length - 1 && onMove({ source: option, target: options[index + 1] })}
        type="button"
      >
        <FiArrowDown />
      </button>
    </div>
  );
};
