const Loader = () => {
  return (
    <div className="flex absolute inset-0 items-center justify-center">
      <div className="relative w-14 h-14 ">
        <div className="absolute w-full h-full rounded-full border-4 border-black opacity-20"></div>
        <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-black animate-spin"></div>
      </div>
    </div>
  );
};

export default Loader;
