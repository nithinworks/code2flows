export const BackgroundGradient = () => {
  return (
    <>
      {/* Base background */}
      <div className="absolute inset-0 -z-20 bg-[#fbf9f6]" />

      {/* Main section gradient */}
      <div className="fixed top-[25vh] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[500px] -z-10">
        <div
          className="w-full h-full rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at center, #3b82f6 0%, #3b82f6 30%, transparent 70%)",
            transform: "rotate(-10deg)",
            willChange: "transform",
            opacity: 0.2,
            animation: "gradient 15s ease-in-out infinite",
          }}
        />
      </div>
    </>
  );
};
