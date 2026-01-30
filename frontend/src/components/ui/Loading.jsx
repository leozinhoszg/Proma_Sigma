export default function Loading({ text = 'Carregando...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/60">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <span className="loading loading-spinner loading-md text-primary"></span>
        <p className="mt-2 text-sm text-base-content/60">{text}</p>
      </div>
    </div>
  );
}
