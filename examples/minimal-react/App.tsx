/**
 * Minimal playground-style page: Container + Card + Button.
 * Use this to compare with your app if styling doesn't match the playground.
 * Theme is set on <html> in index.html (data-theme="minimal-saas").
 */
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Container,
} from '@mkatogui/uds-react';

export default function App() {
  return (
    <Container size="lg">
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the minimal UDS React starter: one CSS import, one theme, one page with Container, Card, and Button.</p>
          <Button variant="primary" size="md">
            Get started
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
