export default function InputSkeleton({ className }) {
  return (
    <div className="w-full">
      <div
        className={`${className} w-full h-10 py-2 mt-1 px-3 rounded-lg bg-gray-200 animate-pulse`}
      ></div>
    </div>
  );
}
