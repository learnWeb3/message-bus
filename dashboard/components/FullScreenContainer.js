export function FullScreenContainer({ children, alignContent = "center" }) {
  const alignContentStyles = {
    center: "flex justify-center items-center",
  };
  return (
    <div className={`h-screen ${alignContentStyles[alignContent]}`}>
      {children}
    </div>
  );
}
