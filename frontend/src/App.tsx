import { AppRoutes } from "./AppRoutes";
import { BackendStatus } from "./BackendStatus";

export default function App() {
  return (
    <>
      <header className="app-header">
        <p className="app-name">AccessFlow</p>
        <BackendStatus />
      </header>
      <main>
        <AppRoutes />
      </main>
    </>
  );
}
