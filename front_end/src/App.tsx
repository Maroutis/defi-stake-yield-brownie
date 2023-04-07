import { DAppProvider } from "@usedapp/core"
import { Header } from "./components/Header"
import { Container } from "@material-ui/core"
import { Main } from "./components/Main"
import { config } from "./SupportedChains"


function App() {
  return (
    <DAppProvider config={config}>
      <Header />
      <Container maxWidth="md">
        <Main />
      </Container>

    </DAppProvider>

  );
}

export default App;
