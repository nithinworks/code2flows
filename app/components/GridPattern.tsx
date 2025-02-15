export const GridPattern = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <div
        className="absolute inset-0 h-full w-full opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #001e2b 1px, transparent 1px), linear-gradient(to bottom, #001e2b 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
};
