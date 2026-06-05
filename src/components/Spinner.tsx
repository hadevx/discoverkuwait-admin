import clsx from "clsx";

function Spinner({ className }: { className: string }) {
  return (
    <div
      className={clsx(
        "w-6 h-6 border-4 border-t-4   border-solid rounded-full animate-spin",
        className
      )}></div>
  );
}

export default Spinner;
